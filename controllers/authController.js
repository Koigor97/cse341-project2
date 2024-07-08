//* calling the User model
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/userModel');
const appErrorHandler = require('../middleware/errorHandler');
const AppErrorClass = require('../utils/appErrorClass');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // res.status(statusCode).json({ status: 'success', token, data: { user } });
};

//* --------------------- AUTH CONTROLLERS --------------------- */

exports.githubAuthCallback = appErrorHandler.catchAsync(
  async (req, res, next) => {
    //* User authenticated via GitHub

    const user = req.user;
    createAndSendToken(user, 200, res);
  }
);

exports.renderLogin = (req, res) => {
  res.render('login');
};

exports.renderSignup = (req, res) => {
  res.render('signup');
};

/**
 * * Registers a new user in the database and sends a JSON response with a token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.

 */

exports.signup = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  };

  const newUser = await User.create(user);
  createAndSendToken(newUser, 201, res);
});

/**
 * * Logs in a user by verifying the email and password of the user.
 * * If email and password are correct, sends a JSON response with a token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.login = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']

  // TODO 1: check if email and password exist

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppErrorClass('Please provide email and password!', 400));
  }

  // TODO 2: check if user exists and password is correct

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatched(password, user.password))) {
    return next(new AppErrorClass('Incorrect email or password', 401));
  }

  // TODO 3: if everything ok, send token to client`s side
  createAndSendToken(user, 200, res);
});

/**
 * * Logs out a user by deleting the token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.logout = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
});

//********************* AUTHORIZATION MIDDLEWARE ********************/

/**
 * * Checks if the user is authenticated by verifying the token.
 * * If the token is valid, the user is authenticated.
 * * If the token is invalid, the user is not authenticated.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.isAuthenticated = appErrorHandler.catchAsync(async (req, res, next) => {
  // TODO 1: Get token and check if it exists

  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppErrorClass(
        'You are not logged in! Please log in to get access',
        401
      )
    );
  }

  // TODO 2: Verify token

  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // TODO 3: Check if user still exists

  const loggedInUser = await User.findById(decodedJWT.id);
  if (!loggedInUser) {
    return next(
      new AppErrorClass(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // TODO 4: Check if user changed password after the token was issued

  if (loggedInUser.changedPasswordAfter(decodedJWT.iat)) {
    return next(
      new AppErrorClass(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  // * Grant access

  req.user = loggedInUser;

  next();
});

/**
 * * Checks if the user is authorized to perform an action.
 * * Takes an array of roles as arguments. If the user's role
 * * is not `admin` or one of the roles in the array, the user is not authorized and an error is thrown.
 *
 * * @param  {...any} roles
 * * @returns
 */

exports.isAuthorized = appErrorHandler.catchAsync(async (req, res, next) => {
  // if roles ['admin']
  if (req.user.role !== 'admin') {
    return next(
      new AppErrorClass(
        'You do not have permission to perform this action',
        403
      )
    );
  }
  next();
});

/**
 * * Sends a reset token to the user's email.
 * *
 * * @param {Object} req - The request object.
 * * @param {Object} res - The response object.
 * * @param {Function} next - The next middleware function in the stack.
 * * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.forgotPassword = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']

  // TODO 1: Get user email and check if it exists

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppErrorClass('There is no user with that email address', 404)
    );
  }

  // TODO 2: Generate random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO 3: Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? Submit a PUT request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErrorClass(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

/**
 * * Resets the user's password.
 * *
 * * @param {Object} req - The request object.
 * * @param {Object} res - The response object.
 * * @param {Function} next - The next middleware function in the stack.
 * * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.resetPassword = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Authentication']

  // TODO 1: Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // TODO 2: If token has not expired, and there is user, set the new password

  if (!user) {
    return next(new AppErrorClass('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // TODO 3: Update changedPasswordAt property for the user

  // TODO 4: Log the user in, send JWT
  createAndSendToken(user, 200, res);
});

/**
 * * Updates the user's password.
 * *
 * * @param {Object} req - The request object.
 * * @param {Object} res - The response object.
 * * @param {Function} next - The next middleware function in the stack.
 * * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.updatePassword = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Users']

  // TODO 1: Get user from collection

  const user = await User.findOne({ email: req.user.email }).select(
    '+password'
  );

  // TODO 2: Check if POSTed current password is correct

  if (
    !(await user.isPasswordMatched(req.body.currentPassword, user.password))
  ) {
    return next(
      new AppErrorClass(
        'This password is incorrect. Please enter the correct password',
        401
      )
    );
  }

  // TODO 3: If so, update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // TODO 4: Log user in, send JWT

  createAndSendToken(user, 200, res);
});

/**
 * * Login strategy using Password with GitHub Strategy.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
