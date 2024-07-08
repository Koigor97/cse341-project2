// *************************** MODULES ****************** */

// * Modules&Dependencies - bringing to scope for use in this file
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./models/swagger_output.json');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppErrorClass = require('./utils/appErrorClass');
const appErrorHandler = require('./middleware/errorHandler');
const passportConfig = require('./middleware/passportConfig');

//* require the routes
const tvShowsRoutes = require('./routes/tvShowsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoute');

// *************************** GLOBALS ****************** */

//* instantiate express app
const app = express();

// ************************* VIEW ENGINE ***************** */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//* security middleware for HTTP headers
app.use(helmet());

//* passport middleware for authentication
app.use(passportConfig.initialize());

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

//* apply rate limiter for all routes.
app.use('/api', limiter);

//*************************** MIDDLEWARE ****************** */

/**
 * * morgan middleware - for logging requests to the console
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//? allows cross-origin resource sharing
app.use(cors());

//? serves static files
app.use(express.static(`${__dirname}/public`));

//? parses incoming requests with JSON payloads
app.use(express.json({ limit: '10kb' }));

//? cookie parser middleware
app.use(cookieParser());

//? data sanitization against NoSQL query injection
app.use(mongoSanitize());

//? data sanitization against XSS
app.use(xss());

//? prevent parameter pollution
app.use(
  hpp({
    whitelist: ['genres', 'runtime', 'rating', 'externals']
  })
);

//? parses incoming requests with urlencoded payloads
app.use(express.urlencoded({ extended: false }));

//*************************** ROUTES ****************** */

/**
 * * Routes - defining api routes
 */

app.use('/', authRoutes);
app.use('/api/v1/tv-shows', tvShowsRoutes);
app.use('/api/v1/users', usersRoutes);

// home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

//*************************** SWAGGER ****************** */
const swaggerOptions = {
  swaggerOptions: {
    filter: true
  }
};

app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocument, swaggerOptions)
);

//* error handler middleware
app.all('*', (req, res, next) => {
  next(new AppErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(appErrorHandler.errorHandler);

//*************************** EXPORTS ****************** */

module.exports = app;
