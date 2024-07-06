const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//********************* DOCUMENT MIDDLEWARE ****************** */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//********************* QUERY MIDDLEWARE ****************** */
//? This middleware runs before any .find() query

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//********************* METHODS ****************** */

userSchema.methods.isPasswordMatched = async function (
  loggedInPassword,
  userPassword
) {
  return await bcrypt.compare(loggedInPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //* 1. Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //* 2. Hash the token and set it to the passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //* 3. Set passwordResetExpires field to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //* 4. Return the plain reset token
  console.log({ resetToken });

  return resetToken;
};

//********************* EXPORTS ****************** */
const User = mongoose.model('User', userSchema);
module.exports = User;

// [
//   {
//     "name": "John Doe",
//     "email": "johndoe@example.com",
//     "password": "password123",
//     "passwordConfirm": "password123"
//   },
//   {
//     "name": "Jane Smith",
//     "email": "janesmith@example.com",
//     "password": "janesecurepassword",
//     "passwordConfirm": "janesecurepassword"
//   },
//   {
//     "name": "Alice Johnson",
//     "email": "alicejohnson@example.com",
//     "password": "alicepassword456",
//     "passwordConfirm": "alicepassword456"
//   },
//   {
//     "name": "Bob Brown",
//     "email": "bobbrown@example.com",
//     "password": "bobsecure789",
//     "passwordConfirm": "bobsecure789"
//   },
//   {
//     "name": "Charlie Green",
//     "email": "charliegreen@example.com",
//     "password": "charliepass012",
//     "passwordConfirm": "charliepass012"
//   }
// ]
