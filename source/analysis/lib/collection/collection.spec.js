'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Collection = require('./collection.js');

describe('Collection', function() {

    describe('#indexFace', function() {
        let faceData = {
            FaceRecords: [{
              Face: {
                BoundingBox: {
                  Height: 1,
                  Left: 2,
                  Top: 3,
                  Width: 4
                },
                Confidence: 99,
                FaceId: "ff43d742-0c13-5d16-a3e8-03d3f58e980b",
                ImageId: "465f4e93-763e-51d0-b030-b9667a2d94b1"
              }
            }]
        };

        let event_info = {
            CollectionId: "us-east-1-0bae584a-6bdb-48da-a553-47105c568bba",
            DetectionAttributes: ["ALL"],
            ExternalImageId: 'Name',
            Image: {
                S3Object: {
                    Bucket: 'media-analysis-sample-bucket',
                    Name: 'private/us-east-1:0bae584a-6bdb-48da-a553-47105c568bba/collection/509c6a59-082d-41b5-b3e2-67f1dd9219b4/Name'
                }
            }
        };

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return face details when indexFace is successful', function(done) {

            AWS.mock('Rekognition', 'indexFaces', function(params, callback) {
                callback(null, faceData);
            });

            let _collection = new Collection();
            _collection.indexFace(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.FaceRecords.length, 1);
                    done();
                }
            });
        });

        it('should return error information when indexFace fails', function(done) {

          AWS.mock('Rekognition', 'indexFaces', function(params, callback) {
              callback('error', null);
          });

          let _collection = new Collection();
          _collection.indexFace(event_info, function(err, data) {
              if (err) {
                  expect(err).to.equal('error');
                  done();
              }
              else {
                  done('invalid failure for negative test');
              }
          });
        });
    });

    describe('#createCollection', function() {

        let collectionData = {
            StatusCode: 200,
            CollectionArn: 'aws:rekognition:us-east-1:xxxxxxxxxxxx:collection/us-east-1-0bae584a-6bdb-48da-a553-47105c568bba',
            FaceModelVersion: '3.0'
        };

        let collectionId = "us-east-1-0bae584a-6bdb-48da-a553-47105c568bba";

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('Rekognition');
        });

        it('should return collection information if createCollection is successful', function(done) {

            AWS.mock('Rekognition', 'createCollection', function(params, callback) {
                callback(null, collectionData);
            });

            let _collection = new Collection();
            _collection.createCollection(collectionId, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.StatusCode,200);
                    done();
                }
            });
        });

        it('should return error if createCollection fails', function(done) {

          AWS.mock('Rekognition', 'createCollection', function(params, callback) {
              callback('error', null);
          });

          let _collection = new Collection();
          _collection.createCollection(collectionId, function(err, data) {
              if (err) {
                  console.log(err);
                  expect(err).to.equal('error');
                  done();
              }
              else {
                  done('invalid failure for negative test');
              }
          });
        });
    });
});
