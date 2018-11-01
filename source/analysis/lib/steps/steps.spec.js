'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Steps = require('./steps.js');

describe('Steps', function() {
    let event_info = {
        Records: [{"eventSource":"media-analysis"}],
        key: "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/33451416-a313-4d30-ae23-82da4cb3c89d/content/image.png",
        file_type: "png",
        owner_id: "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
        object_id: "33451416-a313-4d30-ae23-82da4cb3c89d"
    };

    let state_machine_response = {
        executionArn: "arn:aws:states:us-east-1:xxxxxxxxxxxx:execution:media-analysis-state-machine:33451416-a313-4d30-ae23-82da4cb3c89d"
    };

    describe('#startStateMachine', function() {

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('StepFunctions');
        });

        it('should return state machine ARN if startExecution is successful', function(done) {

            AWS.mock('StepFunctions', 'startExecution', function(params, callback) {
                callback(null, state_machine_response);
            });

            let _steps = new Steps();
            _steps.startStateMachine(event_info, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(data.executionArn, ["arn:aws:states:us-east-1:xxxxxxxxxxxx:execution:media-analysis-state-machine",event_info.object_id].join(':'));
                    done();
                }
            });
        });

        it('should return error if startExecution fails', function(done) {

            AWS.mock('StepFunctions', 'startExecution', function(params, callback) {
                callback('error', null);
            });

            let _steps = new Steps();
            _steps.startStateMachine(event_info, function(err, data) {
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
