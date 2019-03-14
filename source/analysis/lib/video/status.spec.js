'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Status = require('./status.js');

describe('Status', function() {

    let event_info = {
      "owner_id": "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
      "object_id": "33451416-a313-4d30-ae23-82da4cb3c89d",
      "key": "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/video.mov",
      "file_type": "mov",
      "video": {
          "job_id": "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg",
          "status": "IN_PROGRESS"
      }
    };

    let success_response = {JobStatus:"SUCCEEDED"};
    let failure_response = {JobStatus:"FAILED"};

    describe('#getStatus', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return label detection job status if getLabelDetection was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback(null, success_response);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "SUCCEEDED");
                    done();
                }
            });

        });

        it('should return an error if getLabelDetection fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback('error', null);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return celebrity recognition job status if getCelebrityRecognition was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback(null, success_response);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "SUCCEEDED");
                    done();
                }
            });

        });

        it('should return an error if getCelebrityRecognition fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback('error', null);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return face detection job status if getFaceDetection was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback(null, success_response);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "SUCCEEDED");
                    done();
                }
            });

        });

        it('should return an error if getFaceDetection fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback('error', null);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return job status if getPersonTracking was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'persons'].join('_');

            AWS.mock('Rekognition', 'getPersonTracking', function(params, callback) {
                callback(null, success_response);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "SUCCEEDED");
                    done();
                }
            });

        });

        it('should return an error if getPersonTracking fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'persons'].join('_');

            AWS.mock('Rekognition', 'getPersonTracking', function(params, callback) {
                callback('error', null);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return face search job status if getFaceSearch was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback(null, success_response);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "SUCCEEDED");
                    done();
                }
            });

        });

        it('should return an error if getFaceSearch fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback('error', null);
            });

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return NO COLLECTION if a collection does not exist for the user', function(done) {

            event_info.video['job_id'] = "NO COLLECTION";
            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            let _status = new Status();
            _status.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "NO COLLECTION");
                    done();
                }
            });

        });

    });

});
