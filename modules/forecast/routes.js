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

