'use strict';

const chai = require('chai');
const expect = chai.expect;
const { setupServer } = require('./helpers');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const moment = require('moment');
const logger = require('winston');

const forecast = require('./../wrappers/forecast');
const geocoding = require('./../wrappers/geocoding');

describe('forecast routes', function () {

  before(function () {
    // Make the test output less verbose.
    logger.level = 'error';
  });

  beforeEach(function () {
    return setupServer().then(_s => this.server = _s);
  });

  beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
    // Stub out external dependencies.
    this.sandbox.stub(forecast, 'get');
    this.sandbox.stub(forecast, 'getAtTime');
    this.sandbox.stub(geocoding, 'getCoordinatesForLocation');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  // Tests shared functionality among routes.
  function testGeolocationFailure(endpoint) {

    describe('geolocation failure', function () {

      it('should return HTTP 422 when location is not known', function () {
        geocoding.getCoordinatesForLocation.resolves(null);

        return this.server.injectThen({
          url: endpoint
        }).then(res => {
          expect(res.statusCode).to.equal(422);
        });
      });

      it('should return HTTP 500 when geocoding returns an error', function () {
        geocoding.getCoordinatesForLocation.rejects(new Error('oops'));

        return this.server.injectThen({
          url: endpoint
        }).then(res => {
          expect(res.statusCode).to.equal(500);
        });
      });
    });
  }

  // Tests shared functionality among routes.
  function testForecastFailure(endpoint) {

    describe('forecast failure', function () {

      it('should return HTTP 500 when forecast returns an error', function () {
        geocoding.getCoordinatesForLocation.resolves({
          latitude: 0.1, longitude: 0.2
        });

        // Reject both calls to make it easier to reuse the test.
        forecast.get.rejects(new Error('oops'));
        forecast.getAtTime.rejects(new Error('oops'));

        return this.server.injectThen({
          url: endpoint
        }).then(res => {
          expect(res.statusCode).to.equal(500);
        });
      });
    });
  }

  describe('current forecast', function () {

    describe('happy path', function () {

      it('returns the forecast JSON', function () {
        geocoding.getCoordinatesForLocation.resolves({
          latitude: 0.1, longitude: 0.2
        });
        forecast.get.resolves({test: 'json'});

        return this.server.injectThen({
          url: '/weather/sydney'
        }).then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.have.property('test', 'json');

          expect(geocoding.getCoordinatesForLocation)
            .to.have.been.calledWith('sydney');
          expect(forecast.get).to.have.been.calledWith(0.1, 0.2);
        });
      });
    });

    testGeolocationFailure('/weather/sydney');
    testForecastFailure('/weather/sydney');
  });

  describe('forecast for today', function () {

    describe('happy path', function () {

      beforeEach(function () {
        // Note: Seed time is a Friday.
        this.seedTime = moment('2015-04-17');
        this.sandbox.useFakeTimers(this.seedTime.valueOf());
      });


      it('returns the forecast JSON', function () {
        geocoding.getCoordinatesForLocation.resolves({
          latitude: 0.1, longitude: 0.2
        });
        forecast.getAtTime.resolves({test: 'json'});

        return this.server.injectThen({
          url: '/weather/sydney/today'
        }).then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.have.property('test', 'json');

          expect(geocoding.getCoordinatesForLocation)
            .to.have.been.calledWith('sydney');

          expect(forecast.getAtTime)
            .to.have.been.calledWith(0.1, 0.2, sinon.match.string);
          const time = moment(forecast.getAtTime.firstCall.args[2]);

          expect(time.day()).to.equal(moment().day());
        });
      });
    });

    testGeolocationFailure('/weather/sydney/today');
    testForecastFailure('/weather/sydney/today');
  });

  describe('forecast for selected day', function () {

    describe('happy path', function () {

      beforeEach(function () {
        // Set up happy path responses.
        geocoding.getCoordinatesForLocation.resolves({
          latitude: 0.1, longitude: 0.2
        });
        forecast.getAtTime.resolves({test: 'json'});
      });

      beforeEach(function () {
        // Note: Seed time is a Friday.
        this.seedTime = moment('2015-04-17');
        this.sandbox.useFakeTimers(this.seedTime.valueOf());
      });

      describe('if selected day is before today', function () {

        it('returns forecast JSON for selected day next week', function () {
          return this.server.injectThen({
            url: '/weather/sydney/thursday'
          }).then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.have.property('test', 'json');

            expect(geocoding.getCoordinatesForLocation)
              .to.have.been.calledWith('sydney');
            expect(forecast.getAtTime)
              .to.have.been.calledWith(0.1, 0.2, sinon.match.any);

            const time = moment(forecast.getAtTime.firstCall.args[2]);
            const expectedTime = this.seedTime.clone()
              .day('thursday')
              .add(1, 'weeks');
            expect(time.date()).to.equal(expectedTime.date());
          });
        });
      });

      describe('if selected day is today', function () {

        it('returns the forecast JSON for the same day next week', function () {
          return this.server.injectThen({
            url: '/weather/sydney/friday'
          }).then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.have.property('test', 'json');

            expect(geocoding.getCoordinatesForLocation)
              .to.have.been.calledWith('sydney');
            expect(forecast.getAtTime)
              .to.have.been.calledWith(0.1, 0.2, sinon.match.any);

            const time = moment(forecast.getAtTime.firstCall.args[2]);
            const expectedTime = this.seedTime.clone()
              .add(1, 'weeks');
            expect(time.date()).to.equal(expectedTime.date());
          });
        });
      });

      describe('if selected day is in future', function () {

        it('returns the forecast JSON for the selected day', function () {
          return this.server.injectThen({
            url: '/weather/sydney/saturday'
          }).then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.have.property('test', 'json');

            expect(geocoding.getCoordinatesForLocation)
              .to.have.been.calledWith('sydney');
            expect(forecast.getAtTime)
              .to.have.been.calledWith(0.1, 0.2, sinon.match.any);

            const time = moment(forecast.getAtTime.firstCall.args[2]);
            const expectedTime = this.seedTime
              .clone()
              .day('saturday');
            expect(time.date()).to.equal(expectedTime.date());
          });
        });
      });

    });

    testGeolocationFailure('/weather/sydney/today');
    testForecastFailure('/weather/sydney/today');
  });

});
