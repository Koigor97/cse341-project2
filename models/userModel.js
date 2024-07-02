const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

//********************* SCHEMA ****************** */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [
      true,
      'Password is required. Password must be at least 8 characters long'
    ],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password. Passwords must match.'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date
});

//********************* MIDDLEWARE ****************** */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

const User = mongoose.model('User', userSchema);

//********************* EXPORTS ****************** */
module.exports = User;
