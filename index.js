/*eslint no-var: 0, no-process-exit: 0*/
'use strict';

var logger = require('winston');

require('babel/register')({
  blacklist: [],
  optional: [
    'validation.undeclaredVariableCheck'
  ],
  extensions: ['.js'] // which extensions should be transpiled by babel
});

require('./server')
  .start()
  .catch(function (err) {
    logger.error('Error when starting the server!\n',
                 err.name, ':', err.message);
    process.exit(1);
  });
