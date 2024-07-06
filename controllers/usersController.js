//* Defining business logic for users collections

const User = require('../models/userModel');
const appErrorHandler = require('../middleware/errorHandler');
const AppErrorClass = require('../utils/appErrorClass');

//********************* CONTROLLERS ****************** */

const filteredObj = (body, ...allowedFields) => {
  const filteredBody = {};
  console.log(body);
  Object.keys(body).forEach((el) => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = body[el];
    }
  });
  return filteredBody;
};

/**
 ** Retrieves all users from the database and returns them as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.getUsers = appErrorHandler.catchAsync(async (req, res) => {
  // #swagger.tags = ['Users']

  const users = await User.find({});
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});

/**
 ** Retrieves a single user from the database and returns it as a JSON response.
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.getUser = appErrorHandler.catchAsync(async (req, res) => {
  // #swagger.tags = ['Users']

  const user = await User.findById(req.params.id);
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 ** Creates a new user in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.createUser = appErrorHandler.catchAsync(async (req, res) => {
  // #swagger.tags = ['Users']

  const user = await User.create(req.body);
  res.status(201).json({ status: 'success', data: { user } });
});

/**
 ** Updates a user in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.updateUser = appErrorHandler.catchAsync(async (req, res) => {
  // #swagger.tags = ['Users']

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 ** Deletes a user from the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.deleteUser = appErrorHandler.catchAsync(async (req, res) => {
  // #swagger.tags = ['Users']

  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * * Update user's email and name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.updateMe = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Users']
  // TODO: 1. Create error if user POSTs password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrorClass(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // TODO 2: filter out unwanted fields names that are not allowed to be updated

  const filteredBody = filteredObj(req.body, 'name', 'email');

  // TODO 3: update user document
  console.log(req.user.id);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

/**
 * * Delete user account. But we are actually deactivating it.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */

exports.deleteMe = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Users']

  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});
