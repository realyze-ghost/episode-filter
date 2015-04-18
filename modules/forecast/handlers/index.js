'use strict';

const forecast = require('./../wrappers/forecast');
const geocoder = require('./../wrappers/geocoding');
const moment = require('moment');
const Boom = require('boom');

/**
 * Route prerequisite.
 * Sets geo coordinates (`{latitude, longitude}` object) on the request.
 */
exports.fetchCoordinates = function (request, reply) {
  const loc = request.params.location;

  if (!loc) {
    return reply(Boom.badData('missing location'));
  }

  geocoder.getCoordinatesForLocation(loc)
    .then(coords => {
      reply(coords ? coords : Boom.badData('unrecognized location'));
    })
    .catch(reply);
};


/**
 * Route handler.
 * Returns forecast for the next week.
 */
exports.getWeather = (request, reply) => {
  const {longitude, latitude} = request.pre.coordinates;

  forecast.get(latitude, longitude)
    .then(reply)
    .catch(reply);
};

/**
 * Route handler.
 * Returns forecast for today.
 */
exports.getWeatherForToday = (request, reply) => {
  const {longitude, latitude} = request.pre.coordinates;
  const now = moment().toISOString();

  forecast.getAtTime(latitude, longitude, now)
    .then(reply)
    .catch(reply);
};

/**
 * Route handler.
 * Returns forecast for the specified day of week. Always the one to come,
 * i.e., in future. Otherwise it wouldn't be forecast, duh.
 */
exports.getWeatherForDayOfWeek = (request, reply) => {
  const {longitude, latitude} = request.pre.coordinates;
  const now = moment();
  const requestedDay = now.clone().day(request.params.dayOfWeek).startOf('day');

  // If requested day is today or earlier, add a week.
  const time = requestedDay > now ? requestedDay : requestedDay.add(1, 'week');

  forecast.getAtTime(latitude, longitude, time.toISOString())
    .then(reply)
    .catch(reply);
};
