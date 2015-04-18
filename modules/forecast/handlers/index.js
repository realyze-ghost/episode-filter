'use strict';

const forecast = require('./../wrappers/forecast');
const geocoder = require('./../wrappers/geocoding');
const moment = require('moment');
const Boom = require('boom');
//const logger = require('winston');

/**
 * Route prerequisite.
 * Sets geo coordinates (`{latitude, longitude}` object) on the request.
 */
exports.fetchCoordinates = function (request, reply) {
  const loc = request.params.location;

  if (!loc) {
    return reply(Boom.badData('missing location'));
  }

  const result = geocoder.getCoordinatesForLocation(loc)
    .then(coords => {
      return coords ? coords : Boom.badData('unrecognized location');
    });

  return reply(result);
};


/**
 * Route handler.
 * Returns forecast for the next week.
 */
exports.getWeather = (request, reply) => {
  const {longitude, latitude} = request.pre.coordinates;

  const result = forecast.get(latitude, longitude);

  return reply(result);
};

/**
 * Route handler.
 * Returns forecast for today.
 */
exports.getWeatherForToday = (request, reply) => {
  const {longitude, latitude} = request.pre.coordinates;
  const now = moment().toISOString();

  const result = forecast.getAtTime(latitude, longitude, now);

  return reply(result);
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

  const result = forecast.getAtTime(latitude, longitude, time);

  return reply(result);
};
