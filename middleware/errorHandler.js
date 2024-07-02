//* Error handler middleware file
const dotenv = require('dotenv');
dotenv.config();
const AppErrorClass = require('../utils/appErrorClass');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppErrorClass(message, 400);
};

const errorHandlerDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const errorHandlerProd = (err, res) => {
  /***
   * * Checks if the error is an Operational Error
   * * which is defined in the AppErrorClass. If it is
   * * then it sends a JSON response with the status
   * * code, status, and message from the error. And if
   * * it is not then it sends a generic response with a
   * * status code of 500 and an error message
   */

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log('Error 😵‍💫', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorHandlerDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    errorHandlerProd(error, res);
  }
};

exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
