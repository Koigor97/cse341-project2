/**
 * ? This file contains helper functions for the project
 * ? functions that will be used in multiple files
 */

//*-------------------------- HELPER FUNCTIONS ---------------------------//

/**
 * * Parse a string representation of an array into an actual array.
 * * @param {string} value - The string representation of an array.
 * * @returns {Array|any} - The parsed array or the original value if parsing fails.
 */
function parseArrayString(value) {
  //* value = '["Drama", "Comedy", "Action"]'

  if (
    typeof value === 'string' &&
    value.startsWith('[') &&
    value.endsWith(']')
  ) {
    try {
      console.log('Parsing array from query parameter:', value);
      return JSON.parse(value.trim()); //* value = ['Drama', 'Comedy', 'Action']
    } catch (error) {
      console.error('Failed to parse array from query parameter:', error);
      return value; //* Return the original value if parsing fails
    }
  }
  return value; //* Return the original value if it is not an array
}

/**
 * * Convert a string representation of a value to its appropriate type.
 * * @param {string} value - The string representation of the value.
 * * @returns {any} - The converted value.
 */
function convertValue(value) {
  if (typeof value === 'string') {
    //* Convert to number if the value is a valid number
    if (!isNaN(value)) {
      return parseFloat(value);
    }
    //* Convert to boolean if the value is "true" or "false"
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }
  return value;
}

/**
 * * Process query parameters recursively to handle nested objects and arrays.
 * * @param {Object} params - The query parameters from the request.
 */
function processParams(params) {
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      params[key] = parseArrayString(params[key]);
      params[key] = convertValue(params[key]);

      if (typeof params[key] === 'object' && !Array.isArray(params[key])) {
        processParams(params[key]);
      }
    }
  }
}

/**
 * * Convert query parameters to MongoDB-compatible query objects.
 * * To handle query parameters that involve advanced filtering
 * * like filtering by weight or rating, using the `$gte` operator,
 * * and other operators, use the `$` prefix. Because we can't use
 * * the `$` operator in the query string, we need to convert the
 * * query parameters to a MongoDB-compatible query object.
 *
 * * @param {Object} queryParams - The query parameters from the request.
 * * @returns {Object} - The MongoDB-compatible query object.
 */
function convertQueryParams(queryParams) {
  console.log(`-----------------QUERY PARAMS-----------------`);
  console.log(`queryParams:`, queryParams);

  /**
   * * The code below uses regex matching to find specific query operators
   * * within a query string and converts them to MongoDB-compatible operators
   * * by prefixing them with a dollar sign (`$`). For example, if the query
   * * string contains `gt`, it will be converted to `$gt`.
   *
   * * `queryStr.replace(...)` processes the entire query string to replace
   * * matched operators with their MongoDB equivalents.
   *
   * * The regex pattern `/\b(gt|gte|lt|lte|in|ne|eq|like|ilike|notilike|nlike|nregex|regex|notregex|not|nexists|exists|notin|nin|all|size|nsize|ncontains|contains)\b/g`
   * * matches any of the listed operators as whole words. The `\b` ensures
   * * that only complete words are matched, not substrings of other words.
   *
   * * The second argument to `replace` is a callback function that takes
   * * the matched operator (`match`) and returns it prefixed with a dollar
   * * sign (`$`). For example, `gt` becomes `$gt`.
   *
   * * Example:
   * * If `queryStr` is `'weight[gt]=60&rating[gte]=7.5&status[in]=["Ended","Running"]'`,
   * * after running the code, `queryStr` will be transformed to:
   * *
   * * `queryStr = '{"weight": {"$gt": 60}, "rating": {"$gte": 7.5}, "status": {"$in": ["Ended", "Running"]}}'`
   * */

  let queryStr = JSON.stringify(queryParams);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in|ne|eq|like|ilike|notilike|nlike|nregex|regex|notregex|not|nexists|exists|notin|nin|all|size|nsize|ncontains|contains)\b/g,
    (match) => `$${match}`
  );

  const mongoQuery = JSON.parse(queryStr);

  console.log(`-----------------MONGO QUERY-----------------`);
  console.log(mongoQuery);

  processParams(mongoQuery);

  console.log(`---------------PROCESSED QUERY-----------------`);
  console.log(mongoQuery);

  return mongoQuery;
}

module.exports = {
  convertQueryParams,
  parseArrayString
};
