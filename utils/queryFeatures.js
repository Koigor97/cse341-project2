const { convertQueryParams } = require('./helpers');

class QueryAPIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // TODO: BUILD THE QUERY
    // 1.a) FILTERING
    /**
     * * in order to separate the queries from filters,
     * * I would create a shallow copy of the query object
     * * and create an array of fields to exclude from the query
     */

    const queryObj = { ...this.queryString };

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
    this.query = this.query.find(processedQuery);

    return this;
  }

  sort() {
    // 2) SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(`sort by:`, sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-updated');
    }

    return this;
  }

  limitFields() {
    // 3) FIELD LIMITING
    if (this.queryString.fields) {
      console.log(`fields:`, this.queryString.fields);
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(`fields:`, fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) PAGINATION
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    //* if skip is greater than the total number of documents, return an empty array
    if (skip > this.query.length) {
      this.query = [];
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

module.exports = QueryAPIFeatures;
