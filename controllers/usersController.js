//* Defining business logic for users collections

const User = require('../models/userModel');
const appErrorHandler = require('../middleware/errorHandler');

//********************* CONTROLLERS ****************** */

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
