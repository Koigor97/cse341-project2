//* Defining business logic for users collections

const User = require('../models/userModel');

//********************* CONTROLLERS ****************** */

/**
 ** Retrieves all users from the database and returns them as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find(req.query);
    res
      .status(200)
      .json({ status: 'success', results: users.length, data: { users } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Retrieves a single user from the database and returns it as a JSON response.
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Creates a new user in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 ** Updates a user in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Deletes a user from the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
