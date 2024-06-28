const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * * Country schema
 * * @typedef {Object} Country
 * * @property {string} name - Country name
 * * @property {string} code - Country code
 * * @property {string} timezone - Country timezone
 */
const countrySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Country name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Country code is required'],
    trim: true
  },
  timezone: {
    type: String,
    required: [true, 'Country timezone is required'],
    trim: true
  }
});

/**
 * * Network schema
 * * @typedef {Object} Network
 * * @property {number} id - Network ID
 * * @property {string} name - Network name
 * * @property {Country} country - Country object
 */
const networkSchema = new Schema({
  id: {
    type: Number,
    required: [true, 'Network ID is required']
  },
  name: {
    type: String,
    required: [true, 'Network name is required'],
    trim: true
  },
  country: {
    type: countrySchema,
    required: [true, 'Country is required']
  }
});

/**
 * * Schedule schema
 * * @typedef {Object} Schedule
 * * @property {string} time - Time of the show
 * * @property {string[]} days - Days of the week
 */
const scheduleSchema = new Schema({
  time: {
    type: String,
    required: [true, 'Schedule time is required'],
    trim: true
  },
  days: {
    type: [String],
    required: [true, 'Schedule days are required']
  }
});

/**
 * * Rating schema
 * * @typedef {Object} Rating
 * * @property {number} average - Average rating
 */
const ratingSchema = new Schema({
  average: {
    type: Number,
    required: [true, 'Average rating is required']
  }
});

/**
 * * Externals schema
 * * @typedef {Object} Externals
 * * @property {number} tvrage - TVRage ID
 * * @property {number} thetvdb - TheTVDB ID
 * * @property {string} imdb - IMDB ID
 */
const externalsSchema = new Schema({
  tvrage: {
    type: Number,
    required: [true, 'TVRage ID is required']
  },
  thetvdb: {
    type: Number,
    required: [true, 'TheTVDB ID is required']
  },
  imdb: {
    type: String,
    required: [true, 'IMDB ID is required'],
    trim: true
  }
});

/**
 * * Image schema
 * * @typedef {Object} Image
 * * @property {string} medium - Medium-sized image URL
 * * @property {string} original - Original-sized image URL
 */
const imageSchema = new Schema({
  medium: {
    type: String,
    required: [true, 'Medium-sized image URL is required'],
    trim: true
  },
  original: {
    type: String,
    required: [true, 'Original-sized image URL is required'],
    trim: true
  }
});

/**
 * * Links schema
 * * @typedef {Object} Links
 * * @property {Object} self - Self link object
 * * @property {string} self.href - Self link URL
 * * @property {Object} previousepisode - Previous episode link object
 * * @property {string} previousepisode.href - Previous episode link URL
 */
const linksSchema = new Schema({
  self: {
    href: {
      type: String,
      required: [true, 'Self link URL is required'],
      trim: true
    }
  },
  previousepisode: {
    href: {
      type: String,
      required: [true, 'Previous episode link URL is required'],
      trim: true
    }
  }
});

/**
 * * Show schema
 * * @typedef {Object} Show
 * * @property {number} id - Show ID
 * * @property {string} url - Show URL
 * * @property {string} name - Show name
 * * @property {string} type - Show type
 * * @property {string} language - Show language
 * * @property {string[]} genres - Show genres
 * * @property {string} status - Show status
 * * @property {number} runtime - Show runtime
 * * @property {Date} premiered - Show premiere date
 * * @property {string} officialSite - Official site URL
 * * @property {Schedule} schedule - Schedule object
 * * @property {Rating} rating - Rating object
 * * @property {number} weight - Show weight
 * * @property {Network} network - Network object
 * * @property {Object} webChannel - Web channel object (nullable)
 * * @property {Externals} externals - Externals object
 * * @property {Image} image - Image object
 * * @property {string} summary - Show summary
 * * @property {number} updated - Last updated timestamp
 * * @property {Links} _links - Links object
 */
const showSchema = new Schema({
  id: {
    type: Number,
    required: [true, 'Show ID is required']
  },
  url: {
    type: String,
    required: [true, 'Show URL is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Show name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Show type is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Show language is required'],
    trim: true
  },
  genres: {
    type: [String],
    required: [true, 'Show genres are required']
  },
  status: {
    type: String,
    required: [true, 'Show status is required'],
    trim: true
  },
  runtime: {
    type: Number,
    required: [true, 'Show runtime is required']
  },
  premiered: {
    type: Date,
    required: [true, 'Show premiere date is required']
  },
  officialSite: {
    type: String,
    required: [true, 'Official site URL is required'],
    trim: true
  },
  schedule: {
    type: scheduleSchema,
    required: [true, 'Schedule is required']
  },
  rating: {
    type: ratingSchema,
    required: [true, 'Rating is required']
  },
  weight: {
    type: Number,
    required: [true, 'Show weight is required']
  },
  network: {
    type: networkSchema,
    required: [true, 'Network is required']
  },
  webChannel: {
    type: Schema.Types.Mixed,
    default: null
  },
  externals: {
    type: externalsSchema,
    required: [true, 'Externals are required']
  },
  image: {
    type: imageSchema,
    required: [true, 'Image is required']
  },
  summary: {
    type: String,
    required: [true, 'Show summary is required'],
    trim: true
  },
  updated: {
    type: Number,
    required: [true, 'Last updated timestamp is required']
  },
  _links: {
    type: linksSchema,
    required: [true, 'Links are required']
  }
});

module.exports = mongoose.model('TvShow', showSchema);
