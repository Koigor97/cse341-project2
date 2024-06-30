// *************************** MODULES ****************** */

// * Modules&Dependencies - bringing to scope for use in this file
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./models/swagger_output.json');

const AppErrorClass = require('./utils/appErrorClass');
const appErrorHandler = require('./middleware/errorHandler');

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

//*************************** SWAGGER ****************** */
const swaggerOptions = {
  swaggerOptions: {
    docExpansion: 'none',
    defaultModelExpandDepth: -1,
    filter: true
  }
};

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//* error handler middleware
app.all('*', (req, res, next) => {
  next(new AppErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(appErrorHandler.errorHandler);

//*************************** EXPORTS ****************** */

module.exports = app;
