'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Upload = require('./upload.js');

describe('Upload', function() {
    let event_info = {
        Bucket: 's3-bucket-name',
        Key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/entities.json",
        Body: "{ ResultList: [ { Index: 0, Entities: [{ Score: 0.98,Type: 'PERSON',Text: 'name',BeginOffset: 27,EndOffset: 32 }] } ],ErrorList: [] }",
        ContentType: 'application/json'
    };

    let upload_response = {
        Bucket: 's3-bucket-name',
        Key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/results/entities.json"
    };

    describe('#uploadFile', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('S3');
        });

        it('should return success if upload is successful', function(done) {

            AWS.mock('S3', 'upload', function(params, callback) {
                callback(null, upload_response);
            });

            let _upload = new Upload();
            _upload.uploadFile(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data,'Successfully uploaded file to S3');
                    done();
                }
            });
        });

        it('should return error if upload fails', function(done) {

            AWS.mock('S3', 'upload', function(params, callback) {
                callback('error', null);
            });

            let _upload = new Upload();
            _upload.uploadFile(event_info, function(err, data) {
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
