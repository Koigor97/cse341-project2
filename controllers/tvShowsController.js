//* Defining business logic for tv-shows collections

const TvShow = require('../models/tvShowModel');
const { convertQueryParams } = require('../utils/helpers');
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
    // TODO: BUILD THE QUERY
    // 1.a) FILTERING
    /**
     * * in order to separate the queries from filters,
     * * I would create a shallow copy of the query object
     * * and create an array of fields to exclude from the query
     */

    const queryObj = { ...req.query };

    //* fields to exclude from the query
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    console.log(`--------------OBJECT TO QUERY--------------------`);
    console.log(`object to query:`, queryObj);

    // 1.b) ADVANCED FILTERING
    /**
     * * the code below returns a query promise. The query promise
     * * allows us to chain queries using mongoose Model methods
     * * like find, findOne, etc. e.g: TvShow.find({}).limit(10).sort({date: -1})
     * * that is why I omit the `await` keyword, because it would
     * * resolve the promise immediately and returns the data.
     */

    //* convert query parameters to MongoDB-compatible query objects
    const processedQuery = convertQueryParams(queryObj);
    let query = TvShow.find(processedQuery);

    // 2) SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(`sort by:`, sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-updated');
    }

    // 3) FIELD LIMITING
    if (req.query.fields) {
      console.log(`fields:`, req.query.fields);
      const fields = req.query.fields.split(',').join(' ');
      console.log(`fields:`, fields);
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) PAGINATION
    const page = req.query.page * 1 || 1;
    console.log(`page:`, page);
    const limit = req.query.limit * 1 || 10;
    console.log(`limit:`, limit);
    const skip = (page - 1) * limit;
    console.log(`skip:`, skip);
    query = query.skip(skip).limit(limit);

    // TODO: EXECUTE THE QUERY
    const tvShows = await query;

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
