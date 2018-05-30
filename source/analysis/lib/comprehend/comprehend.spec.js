'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Comprehend = require('./comprehend.js');

describe('Comprehend', function() {

    let transcript_response = {
      Body: '{"results": {"transcripts": [{"transcript": "transcript"}]},"status": "COMPLETED"}'
    };

    let mp4_failed_transcript = {
      Body: '{"results": {"transcripts": [{"transcript": ""}]},"status": "MP4 FAILED"}'
    };

    let entity_response = {
      ResultList: [
        { Index: 0,
          Entities:[
            { Score: 0.98,
              Type: 'ORGANIZATION',
              Text: 'Transcript',
              BeginOffset: 0,
              EndOffset: 20
            }
          ]
        }
      ],
      ErrorList: []
    };

    let phrase_response = {
      ResultList: [
        { Index: 0,
          KeyPhrases:[
            { Score: 0.90,
              Text: 'Transcript',
              BeginOffset: 0,
              EndOffset: 10
            }
          ]
        }
      ],
      ErrorList: []
    };

    let empty_response = {
      ResultList: [],
      ErrorList: []
    };

    let event_info = {
        "owner_id": "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
        "object_id": "33451416-a313-4d30-ae23-82da4cb3c89d",
        "results": {
          "transcript": {
            "key": "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/transcript.json",
            "status": "COMPLETE"
          }
        }
      };

    describe('#getEntities', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Comprehend');
          AWS.restore('S3');
        });

        it('should return entity information if s3 get and batchDetectEntities are successful', function(done) {

            AWS.mock('Comprehend', 'batchDetectEntities', function(params, callback) {
                callback(null, entity_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.entities.length, 1);
                    done();
                }
            });
        });

        it('should return no entities if batchDetectEntities detects no entities', function(done) {

            AWS.mock('Comprehend', 'batchDetectEntities', function(params, callback) {
                callback(null, empty_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.entities.length, 0);
                    done();
                }
            });
        });

        it('should return no entities if an MP4 transcript failed', function(done) {

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, mp4_failed_transcript);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.entities.length, 0);
                    done();
                }
            });
        });

        it('should return error if S3 upload fails', function(done) {

            AWS.mock('Comprehend', 'batchDetectEntities', function(params, callback) {
                callback(null, entity_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
            });
        });

        it('should return error if batchDetectEntities fails', function(done) {

            AWS.mock('Comprehend', 'batchDetectEntities', function(params, callback) {
                callback('error', null);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
            });
        });

        it('should return error if getObject fails', function(done) {

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback('error', null);
            });

            let _comprehend = new Comprehend();
            _comprehend.getEntities(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
            });
        });
    });

    describe('#getPhrases', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Comprehend');
          AWS.restore('S3');
        });

        it('should return phrase information if s3 get and batchDetectKeyPhrases are successful', function(done) {

            AWS.mock('Comprehend', 'batchDetectKeyPhrases', function(params, callback) {
                callback(null, phrase_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.phrases.length, 1);
                    done();
                }
            });
        });

        it('should return no phrases if batchDetectKeyPhrases detects no phrases', function(done) {

            AWS.mock('Comprehend', 'batchDetectKeyPhrases', function(params, callback) {
                callback(null, empty_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.phrases.length, 0);
                    done();
                }
            });
        });

        it('should return no phrases if an MP4 transcript failed', function(done) {

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, mp4_failed_transcript);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.phrases.length, 0);
                    done();
                }
            });
        });

        it('should return error if S3 upload fails', function(done) {

            AWS.mock('Comprehend', 'batchDetectKeyPhrases', function(params, callback) {
                callback(null, phrase_response);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
            });
        });

        it('should return error if batchDetectKeyPhrases fails', function(done) {

            AWS.mock('Comprehend', 'batchDetectKeyPhrases', function(params, callback) {
                callback('error', null);
            });

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback(null, transcript_response);
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
            });
        });

        it('should return error if getObject fails', function(done) {

            AWS.mock('S3', 'getObject', function(params, callback) {
                callback('error', null);
            });

            let _comprehend = new Comprehend();
            _comprehend.getPhrases(event_info, function(err, data) {
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
