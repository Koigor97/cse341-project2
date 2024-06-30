//* using express router to create modular, mountable route handlers
const express = require('express');
const router = express.Router();
const tvShowsController = require('../controllers/tvShowsController');

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
  .get(tvShowsController.getTvShows)
  .post(tvShowsController.createTvShow);

router
  .route('/:id')
  .get(tvShowsController.getTvShow)
  .put(tvShowsController.updateTvShow)
  .delete(tvShowsController.deleteTvShow);

//*************************** EXPORTS ****************** */

module.exports = router;
