/******************** MODULES ******************** */

// * Dependencies - bringing to scope for use in this file
const mongoose = require('mongoose');
const dotenv = require('dotenv').config(); //* use to load environment variables from .env file
const app = require('./app');

/******************** GLOBALS ******************** */

//* Connect to MongoDB and starting the server

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGO_DB_URI.replace(
  '<PASSWORD>',
  process.env.MONGO_DB_PASSWORD
);

mongoose
  .connect(MONGODB_URI)
  .then((con) => {
    console.log(
      `MongoDB Connected: Database name: ${con.connections[0].name}\nDatabase collection: ${con.connections[0].collections}`
    );

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
  });
