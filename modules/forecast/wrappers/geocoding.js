'use strict';

const config = require('config');
const Promise = require('bluebird');

const extra = {
  apiKey: config.get('apis.google.key'),
  formatter: null
};

const geocoder = require('node-geocoder')('google', 'https', extra);

module.exports = {
  // Useful for testing.
  _geocoder: geocoder,

  /*
   * Returns a promise for {latitude, longitude} object for the
   * provided location string or promise for `null` if the location isn't
   * recognized.
   * Uses Google geocoding API.
   */
  getCoordinatesForLocation: (location) => {
    const result = geocoder.geocode(location)
      .then(res => {
        if (!res.length) {
          return null;
        }
        return {
          latitude: res[0].latitude,
          longitude: res[0].longitude
        };
      });

    // Bluebirdize the promise.
    return Promise.resolve(result);
  }
};
