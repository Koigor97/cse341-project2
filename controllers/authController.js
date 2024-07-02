//* calling the User model
const User = require('../models/userModel');
const appErrorHandler = require('../middleware/errorHandler');

//* --------------------- AUTH CONTROLLERS --------------------- */

exports.signup = appErrorHandler.catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'success', data: { user: newUser } });
});
