'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Transcribe = require('./transcribe.js');

describe('Transcribe', function() {
    let event_info = {
        Records: [{"eventSource":"media-analysis"}],
        key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/audio.mp3",
        file_type: "mp3",
        owner_id: "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
        object_id: "33451416-a313-4d30-ae23-82da4cb3c89d"
    };

    let start_job_response = {
        TranscriptionJob: {
            TranscriptionJobName: "33451416-a313-4d30-ae23-82da4cb3c89d_transcription",
            TranscriptionJobStatus: "IN_PROGRESS",
            LanguageCode: "en-US",
            MediaFormat: "mp3",
            Media: {},
            Transcript: {},
            Settings: {}
        }
    };

    let get_status_response = {
        TranscriptionJob: {
            TranscriptionJobName: "33451416-a313-4d30-ae23-82da4cb3c89d_transcription",
            TranscriptionJobStatus: "IN_PROGRESS"
        }
    };

    describe('#startTranscription', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('TranscribeService');
        });

        it('should return information about the transcription job if startTranscriptionJob is successful', function(done) {

            AWS.mock('TranscribeService', 'startTranscriptionJob', function(params, callback) {
                callback(null, start_job_response);
            });

            let _transcribe = new Transcribe();
            _transcribe.startTranscription(event_info, function(err, data) {
                if (err) done(err);
                else {
                    expect(data.jobName).to.equal([event_info.object_id,'transcription'].join('_'));
                    expect(data.jobDidStart).to.equal(true);
                    done();
                }
            });
        });

        it('should return error if startTranscriptionJob fails', function(done) {

            AWS.mock('TranscribeService', 'startTranscriptionJob', function(params, callback) {
                callback('error', null);
            });

            let _transcribe = new Transcribe();
            _transcribe.startTranscription(event_info, function(err, data) {
                if (err) {
                    expect(err.jobDidStart).to.equal(false);
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });
    });

    describe('#getStatus', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('TranscribeService');
        });

        it('should return status of the transcription job if getTranscriptionJob is successful', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_')
            };

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback(null, get_status_response);
            });

            let _transcribe = new Transcribe();
            _transcribe.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "IN_PROGRESS");
                    done();
                }
            });
        });

        it('should return error if getTranscriptionJob fails', function(done) {

          event_info['transcribe'] = {
            jobDidStart: true,
            jobName: [event_info.object_id,'transcription'].join('_')
          };

          AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
              callback('error', null);
          });

          let _transcribe = new Transcribe();
          _transcribe.getStatus(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              } else {
                  done('invalid failure for negative test');
              }
          });
        });

        it('should return MP4 FAILED if transcription fails but it is an mp4 file', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_')
            };

            event_info.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/video.mp4";
            event_info.file_type = "mp4";
            get_status_response.TranscriptionJob.TranscriptionJobStatus = "FAILED";

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback(null, get_status_response);
            });

            let _transcribe = new Transcribe();
            _transcribe.getStatus(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data, "MP4 FAILED");
                    done();
                }
            });
        });
    });

    describe('#getResults', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('TranscribeService');
          AWS.restore('S3');
        });

        it('should return location of transcript if getTranscriptionJob and upload are successful', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_'),
              status: 'COMPLETED'
            };

            get_status_response['Transcript'] = {
                TranscriptFileUri: "https://s3.us-east-1.amazonaws.com/aws-transcribe-us-east-1-prod/xxxxxxxxxxxx/33451416-a313-4d30-ae23-82da4cb3c89d_transcription/asrOutput.json?X-Amz-Security-Token=123abc"
            };

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback(null, get_status_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _transcribe = new Transcribe();
            _transcribe.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.key, ['private',event_info.owner_id,'media',event_info.object_id,'results','transcript.json'].join("/"));
                    done();
                }
            });
        });

        it('should return location of transcript if transcription failed and the file_type is mp4 and getTranscriptionJob and upload are successful', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_'),
              status: 'MP4 FAILED'
            };

            event_info.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/video.mp4";
            event_info.file_type = "mp4";
            get_status_response.TranscriptionJob.TranscriptionJobStatus = "FAILED";

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback(null, get_status_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _transcribe = new Transcribe();
            _transcribe.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.key, ['private',event_info.owner_id,'media',event_info.object_id,'results','transcript.json'].join("/"));
                    done();
                }
            });
        });

        it('should return an error if upload fails', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_'),
              status: 'COMPLETED'
            };

            get_status_response['Transcript'] = {
                TranscriptFileUri: "https://s3.us-east-1.amazonaws.com/aws-transcribe-us-east-1-prod/xxxxxxxxxxxx/33451416-a313-4d30-ae23-82da4cb3c89d_transcription/asrOutput.json?X-Amz-Security-Token=123abc"
            };

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback(null, get_status_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _transcribe = new Transcribe();
            _transcribe.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return an error if getTranscriptionJob fails', function(done) {

            event_info['transcribe'] = {
              jobDidStart: true,
              jobName: [event_info.object_id,'transcription'].join('_'),
              status: 'COMPLETED'
            };

            AWS.mock('TranscribeService', 'getTranscriptionJob', function(params, callback) {
                callback('error', null);
            });

            let _transcribe = new Transcribe();
            _transcribe.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

    });

    describe('#generateJobName', () => {
        it ('should return a unique ID for each invocation', () => {
            let _transcribe = new Transcribe();
            let jobName = _transcribe.generateJobName({ object_id: 'foo' });
            assert.notEqual(jobName, _transcribe.generateJobName({ object_id: 'foo' }));
        });
    });

});
