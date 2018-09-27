'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Image = require('./image.js');

describe('Image', function() {

    let event_info = {
      "owner_id": "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
      "object_id": "33451416-a313-4d30-ae23-82da4cb3c89d",
      "key": "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/image.png",
      "file_type": "png"
    };

    let label_response = {
        Labels: [
            {
              Confidence: 99,
              Name: "People"
            }
        ]
    };

    let empty_label_response = {Labels: []};

    let celeb_response = {
        CelebrityFaces: [
            {
              MatchConfidence: 99,
              Name: 'Celeb Name',
              Id: "celeb-id-1234",
              Face: {}
            }
        ],
        UnrecognizedFaces: []
    };

    let empty_celeb_response = {CelebrityFaces: [], UnrecognizedFaces: []};

    let face_response = {
        FaceDetails: [{
            BoundingBox: {},
            AgeRange: {},
            Smile: {
              Value: true,
              Confidence: 98
            },
            Eyeglasses: {
              Value: false,
              Confidence: 99
            },
            Sunglasses: {
              Value: false,
              Confidence: 99
            },
            Gender: {
              Value: "Female",
              Confidence: 100
            },
            Beard: {
              Value: false,
              Confidence: 99
            },
            Mustache: {
              Value: false,
              Confidence: 98
            },
            EyesOpen: {
              Value: true,
              Confidence: 99
            },
            MouthOpen: {
              Value: true,
              Confidence: 98
            },
            Emotions: [{
              Type: "HAPPY",
              Confidence: 99
            }, {
              Type: "CALM",
              Confidence: 8
            }, {
              Type: "ANGRY",
              Confidence: 0.75
            }],
            Confidence: 99
        }]
    };

    let empty_face_response = {FaceDetails:[]};

    let face_match_response = {
        FaceMatches: [
           {
            Face: {
             BoundingBox: {},
             Confidence: 99,
             FaceId: "38271d79-7bc2-5efb-b752-398a8d575b85",
             ImageId: "7ba2f6b1-adb2-4e16-a9c7-450c1cd35e9a",
             ExternalImageId: "KnownFaceName"
            },
            Similarity: 99
           }
        ],
        SearchedFaceBoundingBox: {},
        SearchedFaceConfidence: 99
      };

    let empty_face_match_response = {FaceMatches:[]};

    describe('#getLabels', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        it('should return label information if detectLabels and upload are successful', function(done) {

            AWS.mock('Rekognition', 'detectLabels', function(params, callback) {
                callback(null, label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getLabels(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.labels.length, 1);
                    done();
                }
            });
        });

        it('should return empty label array if no labels are detected', function(done) {

            AWS.mock('Rekognition', 'detectLabels', function(params, callback) {
                callback(null, empty_label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getLabels(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.labels.length, 0);
                    done();
                }
            });
        });

        it('should return error if upload fails', function(done) {

            AWS.mock('Rekognition', 'detectLabels', function(params, callback) {
                callback(null, label_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getLabels(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return error if detectLabels', function(done) {

            AWS.mock('Rekognition', 'detectLabels', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getLabels(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

    });

    describe('#getCelebs', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        it('should return celebrity information if recognizeCelebrities and upload are successful', function(done) {

            AWS.mock('Rekognition', 'recognizeCelebrities', function(params, callback) {
                callback(null, celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getCelebs(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.celebs.length, 1);
                    done();
                }
            });
        });

        it('should return empty celeb array if no celebs are detected', function(done) {

            AWS.mock('Rekognition', 'recognizeCelebrities', function(params, callback) {
                callback(null, empty_celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getCelebs(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.celebs.length, 0);
                    done();
                }
            });
        });

        it('should return error if upload fails', function(done) {

            AWS.mock('Rekognition', 'recognizeCelebrities', function(params, callback) {
                callback(null, celeb_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getCelebs(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return error if recognizeCelebrities fails', function(done) {

            AWS.mock('Rekognition', 'recognizeCelebrities', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getCelebs(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

    });

    describe('#getFaces', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        it('should return face attribute information if detectFaces and upload are successful', function(done) {

            AWS.mock('Rekognition', 'detectFaces', function(params, callback) {
                callback(null, face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getFaces(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.faces_detected, true);
                    done();
                }
            });
        });

        it('should return empty face array if no faces are detected', function(done) {

            AWS.mock('Rekognition', 'detectFaces', function(params, callback) {
                callback(null, empty_face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            let _image = new Image();
            _image.getFaces(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.faces_detected, false);
                    done();
                }
            });
        });

        it('should return error if upload fails', function(done) {

            AWS.mock('Rekognition', 'detectFaces', function(params, callback) {
                callback(null, face_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getFaces(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return error if detectFaces fails', function(done) {

            AWS.mock('Rekognition', 'detectFaces', function(params, callback) {
                callback('error', null);
            });

            let _image = new Image();
            _image.getFaces(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });
    });

    describe('#getFaceMatches', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
          AWS.restore('S3');
        });

        it('should return face match information if faces have been detected and searchFacesByImage and upload are successful', function(done) {

            AWS.mock('Rekognition', 'searchFacesByImage', function(params, callback) {
                callback(null, face_match_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            event_info['results'] = {"faces": {"faces_detected": true}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) done(err);
                else {
                    console.log(data);
                    assert.equal(data.face_matches.length, 1);
                    done();
                }
            });
        });

        it('should return empty known face array if faces have not been detected', function(done) {

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            event_info['results'] = {"faces": {"faces_detected": false}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.face_matches.length, 0);
                    done();
                }
            });
        });

        it('should return empty known face array if faces have been detected but no known faces are found', function(done) {

            AWS.mock('Rekognition', 'searchFacesByImage', function(params, callback) {
                callback(null, empty_face_match_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            event_info['results'] = {"faces": {"faces_detected": true}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.face_matches.length, 0);
                    done();
                }
            });
        });

        it('should return error if faces have been detected but upload fails', function(done) {

            AWS.mock('Rekognition', 'searchFacesByImage', function(params, callback) {
                callback(null, face_match_response);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            event_info['results'] = {"faces": {"faces_detected": true}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return error if if faces have been detected but searchFacesByImage fails', function(done) {

            AWS.mock('Rekognition', 'searchFacesByImage', function(params, callback) {
                callback('error', null);
            });

            event_info['results'] = {"faces": {"faces_detected": true}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) {
                    expect(err).to.equal('error');
                    done();
                } else {
                    done('invalid failure for negative test');
                }
            });
        });

        it('should return empty known face array if a collection does not exist for the user', function(done) {

            let error = {code: "ResourceNotFoundException"};

            AWS.mock('Rekognition', 'searchFacesByImage', function(params, callback) {
                callback(error, null);
            });

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, 'Successfully uploaded file to S3');
            });

            event_info['results'] = {"faces": {"faces_detected": true}};

            let _image = new Image();
            _image.getFaceMatches(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.face_matches.length, 0);
                    done();
                }
            });
        });

    });
});
