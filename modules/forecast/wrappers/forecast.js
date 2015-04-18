'use strict';

const Forecast = require('forecast.io');
const config = require('config');
const Promise = require('bluebird');
const moment = require('moment');

const options = {
  APIKey: config.get('apis.forecast.key')
};

const forecast = new Forecast(options);

module.exports = {

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
      const _time = moment(time).toISOString();
      forecast.getAtTime(lat, long, _time, (err, res, data) => {
        if (err || res.statusCode !== 200) {
          return reject(err || new Error(data));
        }
        return resolve(data);
      });
    });
  }
};
