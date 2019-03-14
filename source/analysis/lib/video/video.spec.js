'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Video = require('./video.js');

describe('Video', function() {

    let event_info = {
      "owner_id": "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
      "object_id": "33451416-a313-4d30-ae23-82da4cb3c89d",
      "key": "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/video.mov",
      "file_type": "mov"
    };

    let job_start_response = {JobId: "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg"};

    describe('#startLabels', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return label detection job information if startLabelDetection was successful', function(done) {

            AWS.mock('Rekognition', 'startLabelDetection', function(params, callback) {
                callback(null, job_start_response);
            });

            let _video = new Video();
            _video.startLabels(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'labels'].join('_'));
                    assert.equal(data.job_id, "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg");
                    done();
                }
            });

        });

        it('should return an error if startLabelDetection fails', function(done) {

            AWS.mock('Rekognition', 'startLabelDetection', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startLabels(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });
    });

    describe('#startPersons', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return job information if startPersonTracking was successful', function(done) {

            AWS.mock('Rekognition', 'startPersonTracking', function(params, callback) {
                callback(null, job_start_response);
            });

            let _video = new Video();
            _video.startPersons(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'persons'].join('_'));
                    assert.equal(data.job_id, "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg");
                    done();
                }
            });

        });

        it('should return an error if startPersonTracking fails', function(done) {

            AWS.mock('Rekognition', 'startPersonTracking', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startPersons(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });
    });

    describe('#startCelebs', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return celebrity recognition job information if startCelebrityRecognition was successful', function(done) {

            AWS.mock('Rekognition', 'startCelebrityRecognition', function(params, callback) {
                callback(null, job_start_response);
            });

            let _video = new Video();
            _video.startCelebs(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'celebs'].join('_'));
                    assert.equal(data.job_id, "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg");
                    done();
                }
            });

        });

        it('should return an error if startCelebrityRecognition fails', function(done) {

            AWS.mock('Rekognition', 'startCelebrityRecognition', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startCelebs(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });
    });

    describe('#startFaces', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return face detection job information if startFaceDetection was successful', function(done) {

            AWS.mock('Rekognition', 'startFaceDetection', function(params, callback) {
                callback(null, job_start_response);
            });

            let _video = new Video();
            _video.startFaces(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'faces'].join('_'));
                    assert.equal(data.job_id, "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg");
                    done();
                }
            });

        });

        it('should return an error if startFaceDetection fails', function(done) {

            AWS.mock('Rekognition', 'startFaceDetection', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startFaces(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });
    });

    describe('#startFaceSearch', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        it('should return face search job information if startFaceSearch was successful', function(done) {

            AWS.mock('Rekognition', 'startFaceSearch', function(params, callback) {
                callback(null, job_start_response);
            });

            let _video = new Video();
            _video.startFaceSearch(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'facesearch'].join('_'));
                    assert.equal(data.job_id, "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg");
                    done();
                }
            });

        });

        it('should return an error if startFaceSearch fails', function(done) {

            AWS.mock('Rekognition', 'startFaceSearch', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startFaceSearch(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return NO COLLECTION status if a collection does not exist for the user and upload is successful', function(done) {

            let no_collection_error = {code: "ResourceNotFoundException"};

            AWS.mock('Rekognition', 'startFaceSearch', function(params, callback) {
                callback(no_collection_error, null);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _video = new Video();
            _video.startFaceSearch(event_info, function(err, data) {
                if (err) done(err);
                else {
                    //assert.equal(data.job_tag, [event_info.object_id,'facesearch'].join('_'));
                    assert.equal(data.job_id, "NO COLLECTION");
                    done();
                }
            });

        });

        it('should return an error if a collection does not exist for the user and upload fails', function(done) {

            let no_collection_error = {code: "ResourceNotFoundException"};

            AWS.mock('Rekognition', 'startFaceSearch', function(params, callback) {
                callback(no_collection_error, null);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _video = new Video();
            _video.startFaceSearch(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });


    });

});
