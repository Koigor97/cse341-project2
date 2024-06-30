//* Defining business logic for tv-shows collections

const { raw } = require('express');
const TvShow = require('../models/tvShowModel');
const QueryAPIFeatures = require('../utils/queryFeatures');
//********************* CONTROLLERS ****************** */

/**
 ** Retrieves all TV shows from the database and returns them as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.getTvShows = async (req, res) => {
  try {
    // TODO: EXECUTE THE QUERY
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
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Retrieves a single TV show from the database and returns it as a JSON response.
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.getTvShow = async (req, res) => {
  try {
    const tvShow = await TvShow.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { tvShow } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Creates a new TV show in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.createTvShow = async (req, res) => {
  try {
    const tvShow = await TvShow.create(req.body);
    res.status(201).json({ status: 'success', data: { tvShow } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 ** Updates a TV show in the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.updateTvShow = async (req, res) => {
  try {
    const tvShow = await TvShow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ status: 'success', data: { tvShow } });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 ** Deletes a TV show from the database and returns it as a JSON response.
 **
 ** @param {Object} req - The request object.
 ** @param {Object} res - The response object.
 ** @return {Promise<void>} A promise that resolves when the response is sent.
 */
exports.deleteTvShow = async (req, res) => {
  try {
    const tvShow = await TvShow.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//* --------------AGGREGATION PIPELINE--------------------- //

/**
 *
 * * Get stats for TV shows with rating greater than or equal to 6.5
 *
 * * @param {*} req
 * * @param {*} res
 */

exports.getTvShowStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * * Getting all shows that have a status of running, and have
 * * Drama in the genre array from the network FOX
 *
 * * @param {*} req
 * * @param {*} res
 */

exports.getRunningFoxTvShows = async (req, res) => {
  try {
    const runningTvShows = await TvShow.aggregate([
      {
        $match: {
          status: 'Running',
          'network.name': 'FOX',
          genres: 'Drama'
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
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
