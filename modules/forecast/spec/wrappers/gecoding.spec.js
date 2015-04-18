'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('chai-as-promised'));
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const logger = require('winston');

const geocoding = require('./../../wrappers/geocoding');

describe('geocoding wrapper', function () {

  before(function () {
    // Make the test output less verbose.
    logger.level = 'error';
  });

  beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.stub(geocoding._geocoder, 'geocode');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  describe('getCoordinatesForLocation', function () {

    it('should return a rejected promise when `geocode` module returns an error', function () {
      geocoding._geocoder.geocode.rejects(new Error('geo error'));
      return expect(geocoding.getCoordinatesForLocation('location'))
        .to.be.rejectedWith('geo error');
    });

    it('should return promise for `null` when location is not recognized', function () {
      geocoding._geocoder.geocode.resolves([]);
      return expect(geocoding.getCoordinatesForLocation('location'))
        .to.eventually.be.null;
    });

    it('should return the coordinates of the first match when location is known', function () {
      geocoding._geocoder.geocode.resolves([{
        latitude: 0.1,
        longitude: 0.2
      }, {
        latitude: 0.4,
        longitude: 0.5
      }]);
      return expect(geocoding.getCoordinatesForLocation('location'))
        .to.eventually.eql({
          latitude: 0.1,
          longitude: 0.2
        });
    });
  });
});
