'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('./helpers');

describe('filter series', function () {

  beforeEach(function () {
    return helpers.setupServer().then(server => this.server = server);
  });

  describe('example request', function () {

    it('should return expected response', function () {
      const payload = require('./fixtures/req_ok_1.json');
      return this.server.injectThen({
        method: 'POST',
        url: '/',
        payload: JSON.stringify(payload)
      }).then(res => {
        const expectedResponse = require('./fixtures/res_ok_1.json');
        expect(res.result).to.eql(expectedResponse);
      });
    });
  });

  describe('when 0 items is sent', function () {

    it('should return empty response', function () {
      const payload = require('./fixtures/res_empty.json');
      return this.server.injectThen({
        method: 'POST',
        url: '/',
        payload: JSON.stringify(payload)
      }).then(res => {
        const expectedResponse = require('./fixtures/res_empty.json');
        expect(res.result).to.eql(expectedResponse);
      });
    });
  });

  describe('when nested field is missing', function () {

    it('should return response without the malformed item', function () {
      const payload = require('./fixtures/req_missing_nested_field.json');
      return this.server.injectThen({
        method: 'POST',
        url: '/',
        payload: JSON.stringify(payload)
      }).then(res => {
        const expectedResponse = require('./fixtures/res_missing_nested_field.json');
        expect(res.result).to.eql(expectedResponse);
      });
    });
  });

  describe('when request payload is malformed JSON', function () {

    beforeEach(function () {
      this.injectedReq = this.server.injectThen({
        method: 'POST',
        url: '/',
        payload: '{invalid JSON'
      });
      return this.injectedReq;
    });

    it('should return HTTP 400', function () {
      this.injectedReq.then(res => {
        expect(res.statusCode).to.eql(400);
      });
    });

    it('should contain expected `error` field', function () {
      return this.injectedReq.then(res => {
        expect(res.result.error).to.contain('Could not decode request');
      });
    });
  });
});
