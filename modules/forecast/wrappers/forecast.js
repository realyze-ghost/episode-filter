'use strict';

const Forecast = require('forecast.io');
const config = require('config');
const Promise = require('bluebird');
const moment = require('moment');
const logger = require('winston');

const options = {
  APIKey: config.get('apis.forecast.key')
};

const forecast = new Forecast(options);

module.exports = {

  // Useful for testing.
  _forecast: forecast,

  /**
   * Returns a Promise for forecast.io forecast for given coordinates.
   */
  get: (lat, long) => {
    return new Promise((resolve, reject) => {
      forecast.get(lat, long, (err, res, data) => {
        if (err || res.statusCode !== 200) {
          return reject(err || new Error(data));
        }
        return resolve(data);
      });
    });
  },

  /**
   * Returns a Promise for forecast.io forecast for given coordinates and time.
   * `time` can be anything `moment` can parse.
   */
  getAtTime: (lat, long, time) => {
    return new Promise((resolve, reject) => {
      const _time = moment(time);
      if (!_time.isValid()) {
        return reject(new Error('invalid time value'));
      }
      logger.info('getLoading forecastfor', lat, long, _time.unix());
      forecast.getAtTime(lat, long, _time.unix(), (err, res, data) => {
        if (err || res.statusCode !== 200) {
          return reject(err || new Error(data));
        }
        return resolve(data);
      });
    });
  }
};
