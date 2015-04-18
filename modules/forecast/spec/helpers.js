'use strict';

const Promise = require('bluebird');
const Hapi = require('hapi');

exports.setupServer = () => {
  let server = new Hapi.Server();
  server.connection({port: 8000});

  return new Promise((resolve, reject) => {
    server.register([
      // Needed to make `inject` work with mocha.
      {register: require('inject-then')},
      {register: require('..')}
    ], (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(server);
    });
  });
};
