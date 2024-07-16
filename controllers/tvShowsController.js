//* Defining business logic for tv-shows collections
const slugify = require('slugify');

const TvShow = require('../models/tvShowModel');
const QueryAPIFeatures = require('../utils/queryFeatures');
const appErrorHandler = require('../middleware/errorHandler');
const AppErrorClass = require('../utils/appErrorClass');

//********************* CONTROLLERS ****************** */

/**
 ** Retrieves all TV shows from the database and returns them as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.getTvShows = appErrorHandler.catchAsync(async (req, res, next) => {
  // TODO: EXECUTE THE QUERY
  // #swagger.tags = ['TV Shows']
  const features = new QueryAPIFeatures(TvShow.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tvShows = await features.query;

  // TODO: SEND RESPONSE
  res
    .status(200)
    .json({ status: 'success', results: tvShows.length, data: { tvShows } });
});

/**
 ** Retrieves a single TV show from the database and returns it as a JSON response.
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.getTvShow = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['TV Shows']

  const tvShow = await TvShow.findById(req.params.id);

  if (!tvShow) {
    return next(new AppErrorClass('No tv show found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { tvShow } });
});

/**
 ** Creates a new TV show in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.createTvShow = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['TV Shows']

  const tvShow = await TvShow.create(req.body);
  res.status(201).json({ status: 'success', data: { tvShow } });
});

/**
 ** Updates a TV show in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.updateTvShow = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['TV Shows']

  const tvShow = await TvShow.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tvShow) {
    return next(new AppErrorClass('No tv show found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { tvShow } });
});

/**
 ** Deletes a TV show from the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */

exports.deleteTvShow = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['TV Shows']

  const tvShow = await TvShow.findByIdAndDelete(req.params.id);

  if (!tvShow) {
    return next(new AppErrorClass('No tv show found with that ID', 404));
  }

  res.status(204).json({ message: 'Deleted successfully' });
});

//* --------------AGGREGATION PIPELINE--------------------- //

/**
 *
 * * Get stats for TV shows with rating greater than or equal to 6.5
 *
 * * @param {*} req
 * * @param {*} res
 */

exports.getTvShowStats = appErrorHandler.catchAsync(async (req, res, next) => {
  // #swagger.tags = ['TV Shows']

  const stats = await TvShow.aggregate([
    {
      $match: { 'rating.average': { $gte: 6.5 } }
    },
    {
      $group: {
        _id: '$network.country.name',
        averageRating: { $avg: '$rating.average' },
        totalRating: { $sum: '$rating.count' },
        maxRating: { $max: '$rating.average' },
        minRating: { $min: '$rating.average' }
      }
    }
  ]);

  res.status(200).json({ status: 'success', data: { stats } });
});

/**
 * * Getting all shows that have a status of running, and have
 * * Drama in the genre array from the network FOX
 *
 * * @param {*} req
 * * @param {*} res
 */

exports.getRunningFoxTvShows = appErrorHandler.catchAsync(
  async (req, res, next) => {
    // #swagger.tags = ['TV Shows']

    const runningTvShows = await TvShow.aggregate([
      {
        $match: {
          status: 'Running',
          'network.name': 'FOX'
        }
      },
      {
        $project: {
          name: 1,
          language: 1,
          genres: 1,
          officialSite: 1,
          runtime: 1,
          rating: 1
        }
      },
      {
        $group: {
          _id: '$name',
          language: { $first: '$language' },
          genres: { $first: '$genres' },
          officialSite: { $first: '$officialSite' },
          avgRuntime: { $avg: '$runtime' },
          maxRating: { $max: '$rating.average' }
        }
      },
      {
        $sort: { 'rating.average': 1 }
      }
    ]);

    res.status(200).json({ status: 'success', data: { runningTvShows } });
  }
);

/**
 * * This controller function gets the TvShows data
 * * from the database and pass the data to the explore
 * * page to display a list of TvShows.
 *
 * * @param {object} req - The Express request object.
 * * @param {object} res - The Express response object.
 * * @param {Function} next - The Express next middleware function.
 */

exports.getExplorePage = appErrorHandler.catchAsync(async (req, res, next) => {
  const query = new QueryAPIFeatures(TvShow.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const shows = await query.query;
  console.log(shows);

  res.render('pages/explore', { shows });
});

/**
 * * This controller function gets the TvShow details
 * * from the database and pass the data to the details
 * * page to display a list of TvShow details.
 *
 * * @param {object} req - The Express request object.
 * * @param {object} res - The Express response object.
 * * @param {Function} next - The Express next middleware function.
 */

exports.getTvShowDetails = appErrorHandler.catchAsync(
  async (req, res, next) => {
    const tvShow = await TvShow.findById(req.params.tvShowId);

    if (!tvShow) {
      return next(new AppErrorClass('No tv show found with that ID', 404));
    }

    const slug = slugify(tvShow.name, { lower: true, strict: true });

    res.render('pages/tvShowDetail', { title: tvShow.name, slug, tvShow });
  }
);

// [
//   {
//     name: 'John Doe',
//     email: 'johndoe@example.com',
//     password: 'password123',
//     passwordConfirm: 'password123'
//   },
//   {
//     name: 'Jane Smith',
//     email: 'janesmith@example.com',
//     password: 'janesecurepassword',
//     passwordConfirm: 'janesecurepassword'
//   },
//   {
//     name: 'Alice Johnson',
//     email: 'alicejohnson@example.com',
//     password: 'alicepassword456',
//     passwordConfirm: 'alicepassword456'
//   },
//   {
//     name: 'Bob Brown',
//     email: 'bobbrown@example.com',
//     password: 'bobsecure789',
//     passwordConfirm: 'bobsecure789'
//   },
//   {
//     name: 'Charlie Green',
//     email: 'charliegreen@example.com',
//     password: 'charliepass012',
//     passwordConfirm: 'charliepass012'
//   }
// ];
