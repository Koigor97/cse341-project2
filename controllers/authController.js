//* calling the User model
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const appErrorHandler = require('../middleware/errorHandler');
const AppErrorClass = require('../utils/appErrorClass');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//* --------------------- AUTH CONTROLLERS --------------------- */

/**
 * * Signs up a new user. Creates a new user in the database. Sends a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.

 */

exports.signup = appErrorHandler.catchAsync(async (req, res, next) => {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  };

  const newUser = await User.create(user);

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', token, data: { newUser } });
});

/**
 * * Logs in a user. Sends a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.login = appErrorHandler.catchAsync(async (req, res, next) => {
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

  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token, data: { user } });
});

//********************* AUTHORIZATION MIDDLEWARE ********************/

exports.isAuthorized = appErrorHandler.catchAsync(async (req, res, next) => {
  // TODO 1: Get token and check if it exists

  let token;
  if (
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

  console.log(decodedJWT);

  // TODO 3: Check if user still exists

  // TODO 4: Check if user changed password after the token was issued
  // TODO 5: Grant access
  next();
});
