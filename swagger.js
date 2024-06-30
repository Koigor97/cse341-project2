//* using swagger autogen to generate swagger docs

const swaggerAutogen = require('swagger-autogen')();

//* specify the output folder
const outputFile = './models/swagger_output.json';

//* specify the endpoints
const endpointsFiles = ['./routes/tvShowsRoutes'];

//* defining a starter doc object: optional
const doc = {
  info: {
    version: '1.0.0',
    title: 'TV Shows API',
    description: 'API for TV Shows'
  },
  host: 'localhost:8000',
  schemes: ['https, http'],
  swagger: '2.0'
};

//* generate swagger docs
swaggerAutogen(outputFile, endpointsFiles, doc);
