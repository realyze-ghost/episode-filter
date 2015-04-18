'use strict';

const routes = require('./routes');
const logger = require('winston');
const path = require('path');

function register(server, options, next) {

  // Load all our routes.
  Object.keys(routes).forEach(function (key) {
    const routeDefinition = routes[key];

    logger.info('%s (%s) to handler %s',
               routeDefinition.path,
               routeDefinition.method,
               key);
    server.route(routeDefinition);
  });

  server.views({
    engines: {
      jade: require('jade')
    },
    path: path.join(__dirname, 'templates'),
    compileOptions: {
      pretty: true
    }
  });

  // Workaround for https://github.com/hapijs/hapi/issues/2278.
  server.expose('addViewManager', function (_server) {
    _server.realm.plugins.vision = server.realm.plugins.vision;
  });

  next();
}

register.attributes = require('./package.json');

exports.register = register;
