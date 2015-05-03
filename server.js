'use strict';

const Glue = require('glue');
const config = require('config');
const logger = require('winston');
const path = require('path');
const { fromNode } = require('bluebird');

const options = {
  relativeTo: path.join(__dirname, 'modules')
};

const manifest = {
  connections: [{
    port: config.get('server.port')
  }],
  plugins: {
    good: {
      opsInterval: 30000,
      reporters: [
        {
          reporter: require('good-console'),
          events: {log: '*', response: '*'}
        }
      ]
    },
    lout: null,
    './episodes': null
  }
};

exports.start = () => {
  return fromNode(Glue.compose.bind(Glue, manifest, options))

    .bind({})

    .then(function (server) {
      this.server = server;
      return fromNode(server.start.bind(server));
    })

    .then(function () {
      this.server.on('request-error', (err) => {
        console.log(err);
      });
      manifest.connections.forEach(conn => {
        logger.info(`Hapi server started at: ${conn.port}`);
      });
    });
};
