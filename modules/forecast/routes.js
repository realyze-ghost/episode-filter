'use strict';

const Joi = require('joi');
const handlers = require('./handlers');
const pkg = require('./package.json');

// Workaround for https://github.com/hapijs/hapi/issues/2278
function addViewManager(request) {
  let server = request.server.plugins[pkg.name];
  server.addViewManager(request.server);
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
            'text/html': (request, reply) => {
              addViewManager(request);
              reply.view('forecast', request.response.source);
            }
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
      pre: [{method: handlers.fetchCoordinates, assign: 'coordinates'}]
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
      pre: [{method: handlers.fetchCoordinates, assign: 'coordinates'}]
    },
    handler: handlers.getWeatherForDayOfWeek
  }
};

