/* eslint no-process-env: 0 */

'use strict';

module.exports = {
  server: {
    port: process.env.PORT || 8000
  },

  apis: {
    google: {
      key: process.env.GOOGLE_API_KEY
    },
    forecast: {
      key: process.env.FORECAST_API_KEY
    }
  }
};
