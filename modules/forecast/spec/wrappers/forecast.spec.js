'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('chai-as-promised'));
const Promise = require('bluebird');
require('sinon-as-promised')(Promise);
const logger = require('winston');
const moment = require('moment');

const forecast = require('./../../wrappers/forecast');

describe('forecast wrapper', function () {

  before(function () {
    // Make the test output less verbose.
    logger.level = 'error';
  });

  beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.stub(forecast._forecast, 'get');
    this.sandbox.stub(forecast._forecast, 'getAtTime');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  describe('get', function () {

    it('should return a rejected promise when `forecast` module returns an error', function () {
      forecast._forecast.get.yields(new Error('Punxsutawney Phil says no'));
      return expect(forecast.get(0.1, 0.2)).to.be.rejected;
    });

    it('should return a rejected promise when `forecast` module returns a non 200 reply', function () {
      forecast._forecast.get.yields(null, {statusCode: 500});
      return expect(forecast.get(0.1, 0.2)).to.be.rejected;
    });

    it('should return a resolved promise when everything is OK', function () {
      forecast._forecast.get.yields(null, {statusCode: 200}, {test: 'data'});
      return expect(forecast.get(0.1, 0.2)).to.eventually.eql({test: 'data'});
    });
  });

  describe('getAtTime', function () {

    it('should return a rejected promise when `forecast` module returns an error', function () {
      forecast._forecast.getAtTime.yields(new Error('Punxsutawney Phil says no'));
      return expect(forecast.getAtTime(0.1, 0.2), moment()).to.be.rejected;
    });

    it('should return a rejected promise when `forecast` module returns a non 200 reply', function () {
      forecast._forecast.getAtTime.yields(null, {statusCode: 500});
      return expect(forecast.getAtTime(0.1, 0.2), moment()).to.be.rejected;
    });

    it('should return a rejected promise when passed an unparsable time', function () {
      forecast._forecast.getAtTime.yields(null, {statusCode: 500});
      return expect(forecast.getAtTime(0.1, 0.2), 'unparsable-time-string').to.be.rejected;
    });

    it('should return a resolved promise when everything is OK', function () {
      forecast._forecast.getAtTime.yields(null, {statusCode: 200}, {test: 'data'});
      return expect(forecast.getAtTime(0.1, 0.2), moment()).to.eventually.eql({test: 'data'});
    });
  });
});

