const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//********************* SCHEMA ****************** */

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    required: function () {
      return !this.githubId && !this.googleId;
    },
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return this.githubId || this.googleId || validator.isEmail(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: function () {
      return !this.githubId && !this.googleId;
    },
    validate: {
      validator: function (value) {
        // Only validate password if not using GitHub OAuth
        return (
          this.githubId ||
          this.googleId ||
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          })
        );
      },
      message:
        'Password must be strong and contain at least 8 characters, including uppercase, lowercase, numbers, and symbols'
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: function () {
      return this.password && !this.githubId && !this.googleId;
    },
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
  },
  image: {
    type: String
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
// {
//   "name": "Jane Smith",
//   "email": "janesmith@example.com",
//   "password": "janesecurepassword",
//   "passwordConfirm": "janesecurepassword"
// },
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
