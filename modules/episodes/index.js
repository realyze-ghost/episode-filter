'use strict';

const routes = require('./routes');

function register(server, options, next) {

  // Load all our routes.
  Object.keys(routes).forEach(function (key) {
    const routeDefinition = routes[key];
    server.route(routeDefinition);
  });

  // Customize payload for JSON parse errors.
  server.ext('onPreResponse', function (request, reply) {
    const response = request.response;
    if (response.isBoom && response.data instanceof SyntaxError) {
      return reply({error: 'Could not decode request: JSON parsing failed'}).code(400);
    }
    return reply.continue();
  });

  next();
}

register.attributes = require('./package.json');

exports.register = register;
