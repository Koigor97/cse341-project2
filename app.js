// *************************** MODULES ****************** */

// * Modules&Dependencies - bringing to scope for use in this file
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

//* require the routes
const tvShowsRoutes = require('./routes/tvShowsRoutes');
const usersRoutes = require('./routes/usersRoutes');

// *************************** GLOBALS ****************** */

//* instantiate express app
const app = express();

//*************************** MIDDLEWARE ****************** */

/**
 * * morgan middleware - for logging requests to the console
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors()); //? allows cross-origin resource sharing
app.use(express.json()); //? parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false })); //? parses incoming requests with urlencoded payloads

//*************************** ROUTES ****************** */

/**
 * * Routes - defining api routes
 */

app.use('/api/v1/tv-shows', tvShowsRoutes);
app.use('/api/v1/users', usersRoutes);

//* error handler middleware
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

//*************************** EXPORTS ****************** */

module.exports = app;
