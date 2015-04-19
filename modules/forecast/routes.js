'use strict';

const Joi = require('joi');
const handlers = require('./handlers');
const pkg = require('./package.json');

function renderTemplate(request, reply) {
  // Workaround for https://github.com/hapijs/hapi/issues/2278
  let server = request.server.plugins[pkg.name];
  server.addViewManager(request.server);

  if (!request.response) {
    return reply(null);
  }
  if (request.response.isBoom) {
    return reply.view('error', request.response);
  }
  return reply.view('forecast', request.response);
}


module.exports = {

  getWeather: {
    method: 'GET',
    path: '/weather/{location}',
    config: {
      description: 'Returns current weather for the given location (using the ' +
        'timeless version of forecast.io API',
      validate: {
        params: {
          location: Joi.string().alphanum()
        }
      },
      pre: [{method: handlers.fetchCoordinates, assign: 'coordinates'}],
      plugins: {
        'hapi-negotiator': {
          mediaTypes: {
            'text/html': renderTemplate
          }
        }
      }
    },
    handler: handlers.getWeather
  },

  getWeatherForToday: {
    method: 'GET',
    path: '/weather/{location}/today',
    config: {
      description: 'Returns weather forecast for today for the given location ' +
        '(using forecast.io API)',
      validate: {
        params: {
          location: Joi.string().alphanum()
        }
      },
      pre: [{method: handlers.fetchCoordinates, assign: 'coordinates'}],
      plugins: {
        'hapi-negotiator': {
          mediaTypes: {
            'text/html': renderTemplate
          }
        }
      }
    },
    handler: handlers.getWeatherForToday
  },

  getWeatherForDayOfWeek: {
    method: 'GET',
    path: '/weather/{location}/{dayOfWeek}',
    config: {
      description: 'Returns weather forecast for the given day and given location' +
        '(using forecast.io API).',
      notes: 'The day is always in the future. If you want today\'s forecast, use ' +
        '`/weather/{location}/today` endpoint.',
      validate: {
        params: {
          location: Joi.string().alphanum(),
          dayOfWeek: Joi.any().only([
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
            'saturday', 'sunday'
          ])
        }
      },
      pre: [{method: handlers.fetchCoordinates, assign: 'coordinates'}],
      plugins: {
        'hapi-negotiator': {
          mediaTypes: {
            'text/html': renderTemplate
          }
        }
      }
    },
    handler: handlers.getWeatherForDayOfWeek
  }
};

