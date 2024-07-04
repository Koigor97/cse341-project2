//* using express router to create modular, mountable route handlers
const express = require('express');
const router = express.Router();
const tvShowsController = require('../controllers/tvShowsController');
const authController = require('../controllers/authController');

//*************************** ROUTES ****************** */

/**
 * * using the route method from express.Router()
 * * function to define and chain route handlers
 */

//* aggregation routes - aggregation pipeline
router.route('/stats').get(tvShowsController.getTvShowStats);
router.route('/runningFoxTvShows').get(tvShowsController.getRunningFoxTvShows);

router
  .route('/')
  .get(authController.isAuthenticated, tvShowsController.getTvShows)
  .post(authController.isAuthenticated, tvShowsController.createTvShow);

router
  .route('/:id')
  .get(authController.isAuthenticated, tvShowsController.getTvShow)
  .put(
    authController.isAuthenticated,
    authController.isAuthorized,
    tvShowsController.updateTvShow
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized,
    tvShowsController.deleteTvShow
  );

//*************************** EXPORTS ****************** */

module.exports = router;
