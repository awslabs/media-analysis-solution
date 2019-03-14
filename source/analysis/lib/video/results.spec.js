'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Results = require('./results.js');

describe('Results', function() {

    let event_info = {
      "owner_id": "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
      "object_id": "33451416-a313-4d30-ae23-82da4cb3c89d",
      "key": "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/video.mov",
      "file_type": "mov",
      "video": {
          "job_id": "98hf230hfpewojdsmdp2f627dg8329hdd3as34j438098hg",
          "status": "SUCCEEDED"
      }
    };

    let label_response = {
        JobStatus: "SUCCEEDED",
        VideoMetadata: {
            DurationMillis: 80000
        },
        Labels: [
          {
            Timestamp: 0,
            Label: {
              Name: "Stage",
              Confidence: 63
            }
          },
          {
            Timestamp: 1000,
            Label: {
              Name: "Person",
              Confidence: 98
            }
          }
        ]
    };

    let celeb_response = {
        JobStatus: "SUCCEEDED",
        VideoMetadata: {
            DurationMillis: 80000
        },
        Celebrities: [
            {
                Timestamp: 0,
                Celebrity: {
                    BoundingBox: {},
                    Confidence: 99,
                    Face: {},
                    Name: "Celeb Name",
                    Id: "8y9dwed32",
                    Urls: []
                }
            }
        ]
    };

    let face_response = {
        JobStatus: "SUCCEEDED",
        VideoMetadata: {
            DurationMillis: 80000
        },
        Faces: [
            {
               Face: {
                  AgeRange: {
                     High: 25,
                     Low: 16
                  },
                  Beard: {
                     Confidence: 75,
                     Value: true
                  },
                  BoundingBox: {},
                  Confidence: 75,
                  Emotions: [
                     {
                        Confidence: 75,
                        Type: "HAPPY"
                     }
                  ],
                  Eyeglasses: {
                     Confidence: 75,
                     Value: true
                  },
                  EyesOpen: {
                     Confidence: 75,
                     Value: true
                  },
                  Gender: {
                     Confidence: 75,
                     Value: "MALE"
                  },
                  Landmarks: [],
                  MouthOpen: {
                     Confidence: 75,
                     Value: true
                  },
                  Mustache: {
                     Confidence: 75,
                     Value: true
                  },
                  Pose: {},
                  Quality: {},
                  Smile: {
                     Confidence: 75,
                     Value: true
                  },
                  Sunglasses: {
                     Confidence: 75,
                     Value: true
                  }
               },
               Timestamp: 1000
            }
        ]
    };

    let persons_response = {
        JobStatus: "SUCCEEDED",
        VideoMetadata: {
            DurationMillis: 80000
        },
        Persons: []
    };

    let facesearch_response = {
        JobStatus: "SUCCEEDED",
        VideoMetadata: {
            DurationMillis: 80000
        },
        Persons: [
            {
              FaceMatches: [
                  {
                     Face: {
                        BoundingBox: {},
                        Confidence: 99,
                        ExternalImageId: "KnownFaceName",
                        FaceId: "38271d79-7bc2-5efb-b752-398a8d575b85",
                        ImageId: "7ba2f6b1-adb2-4e16-a9c7-450c1cd35e9a"
                     },
                     Similarity: 75
                  },
                  {
                     Face: {
                        BoundingBox: {},
                        Confidence: 99,
                        ExternalImageId: "KnownFaceName",
                        FaceId: "0b2b10fe-81a4-40ae-8bc6-fe03c5549535",
                        ImageId: "6d25e9bf-6a2d-4302-9f93-13ac7026a649"
                     },
                     Similarity: 90
                  }
               ],
               Face: {},
               Timestamp: 1000
            }
        ]
    };

    describe('#getResults', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        //Labels
        it('should return label information if getLabelDetection and upload were successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback(null, label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.labels.length, 2);
                    done();
                }
            });

        });

        it('should return empty label array if getLabelDetection detects no labels', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');
            label_response.Labels = [];

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback(null, label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.labels.length, 0);
                    done();
                }
            });

        });

        it('should return an error if upload fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback(null, label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return an error if getLabelDetection fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'labels'].join('_');

            AWS.mock('Rekognition', 'getLabelDetection', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        // Celebs
        it('should return celeb information if getCelebrityRecognition and upload were successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback(null, celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.celebs.length, 1);
                    done();
                }
            });

        });

        it('should return an empty celeb array if getCelebrityRecognition returned no results', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');
            celeb_response.Celebrities = [];

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback(null, celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.celebs.length, 0);
                    done();
                }
            });

        });

        it('should return an error if upload fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback(null, celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return an error if getCelebrityRecognition fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'celebs'].join('_');

            AWS.mock('Rekognition', 'getCelebrityRecognition', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        //Faces
        it('should return face information if getFaceDetection and upload were successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback(null, face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.faces.length, 9);
                    done();
                }
            });

        });

        it('should return an empty face array if getFaceDetection returned no results', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');
            face_response.Faces = [];

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback(null, face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.faces.length, 0);
                    done();
                }
            });

        });

        it('should return an error if upload fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback(null, face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return an error if getFaceDetection fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'faces'].join('_');

            AWS.mock('Rekognition', 'getFaceDetection', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        //Persons
        it('should return information if getPersonTracking and upload were successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'persons'].join('_');

            AWS.mock('Rekognition', 'getPersonTracking', function(params, callback) {
                callback(null, persons_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    done();
                }
            });

        });

        it('should return an error if upload fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'persons'].join('_');

            AWS.mock('Rekognition', 'getPersonTracking', function(params, callback) {
                callback(null, persons_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return an error if getPersonTracking fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'persons'].join('_');

            AWS.mock('Rekognition', 'getPersonTracking', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        //FaceSearch
        it('should return a single known face if getFaceSearch detects multiple instances of the same externalImageId and upload was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback(null, facesearch_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.face_matches.length, 1);
                    done();
                }
            });

        });

        it('should return a multiple known faces if getFaceSearch detects multiple unique known faces and upload was successful', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');
            facesearch_response.Persons[0].FaceMatches[0].Face.ExternalImageId = "KnownFaceName2";

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback(null, facesearch_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.face_matches.length, 2);
                    done();
                }
            });

        });

        it('should return an empty face array if getFaceSearch returned no results', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');
            facesearch_response.Persons = [];

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback(null, facesearch_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.duration, label_response.VideoMetadata.DurationMillis);
                    assert.equal(data.face_matches.length, 0);
                    done();
                }
            });

        });

        it('should return an error if upload fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback(null, facesearch_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });

        });

        it('should return an error if getFaceSearch fails', function(done) {

            event_info.video['job_tag'] = [event_info.object_id,'facesearch'].join('_');

            AWS.mock('Rekognition', 'getFaceSearch', function(params, callback) {
                callback('error', null);
            });

            let _results = new Results();
            _results.getResults(event_info, function(err, data) {
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
