'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');

let Status = require('./status.js');

describe('Status', function() {

    describe('#getStatus', function() {

        let owner_id = "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74";
        let object_id = "33451416-a313-4d30-ae23-82da4cb3c89d";

        let input = {
            Records: [
              {
                eventSource: "media-analysis"
              }
            ],
            upload_time: "datetime",
            size: 1000,
            owner_id: "us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74",
            object_id: "033451416-a313-4d30-ae23-82da4cb3c89d",
        };

        let execution_status = {
            executionArn: "arn::execution",
            stateMachineArn: "arn::state-machine",
            name: "33451416-a313-4d30-ae23-82da4cb3c89d",
            status: "COMPLETE",
            startDate: "",
            stopDate: ""
        };

        let excution_history_response = {
            events: [
                {
                    timestamp: "timestamp",
                    executionStartedEventDetails: {
                        input: "",
                    },
                    type: "ExecutionStarted"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"labels":{"status":"COMPLETE"}}}',
                        name: "Get Label Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"celebs":{"status":"COMPLETE"}}}',
                        name: "Get Celeb Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"faces":{"status":"COMPLETE"}}}',
                        name: "Get Face Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"persons":{"status":"COMPLETE"}}}',
                        name: "Get Persons Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"face_matches":{"status":"COMPLETE"}}}',
                        name: "Get Face-Match Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"face_matches":{"status":"COMPLETE"}}}',
                        name: "Face-Match End"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"transcript":{"status":"COMPLETE"}}}',
                        name: "Get Results"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"phrases":{"status":"COMPLETE"}}}',
                        name: "Get Phrases"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"entities":{"status":"COMPLETE"}}}',
                        name: "Get Entities"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"labels":{"status":"COMPLETE"}}}',
                        name: "Image-Get Labels"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"celebs":{"status":"COMPLETE"}}}',
                        name: "Image-Get Celebs"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"faces":{"status":"COMPLETE"}}}',
                        name: "Image-Get Faces"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"face_matches":{"status":"COMPLETE"}}}',
                        name: "Image-Get Face-Matches"
                    },
                    type: "TaskStateExited"
                },
                {
                    timestamp: "timestamp",
                    stateExitedEventDetails: {
                        output: '{"results":{"face_matches":{"status":"COMPLETE"}}}',
                        name: "Image-Face-Match End"
                    },
                    type: "TaskStateExited"
                }
            ]
        };

        beforeEach(function() {});

        afterEach(function() {
          AWS.restore('StepFunctions');
        });

        it('should return state machine progress for image analysis if describeExecution and getExecutionHistory is successful', function(done) {

            input.file_type = 'png';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/image.png";
            input.file_name = "image.png";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "COMPLETE";
            excution_history_response.events[0].executionStartedEventDetails.input = '{"file_type": "png"}';

            let completed_image = {
                state_machine_status: "COMPLETE",
                analysis: {
                    labels: "COMPLETE",
                    faces: "COMPLETE",
                    celebs: "COMPLETE",
                    face_matches: "COMPLETE"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, excution_history_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(completed_image));
                    done();
                }
            });

        });

        it('should return state machine still in progress for image analysis if stateExitedEventDetails are not available', function(done) {

            input.file_type = 'png';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/image.png";
            input.file_name = "image.png";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "IN PROGRESS";

            let in_progress_response = {};
            in_progress_response['events'] = [];
            in_progress_response['events'][0] = {
                timestamp: "timestamp",
                executionStartedEventDetails: {
                    input: '{"file_type": "png"}',
                },
                type: "ExecutionStarted"
            };

            let in_progress_image = {
                state_machine_status: "IN PROGRESS",
                analysis: {
                    labels: "IN PROGRESS",
                    faces: "IN PROGRESS",
                    celebs: "IN PROGRESS",
                    face_matches: "IN PROGRESS"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, in_progress_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(in_progress_image));
                    done();
                }
            });

        });

        it('should return state machine progress for audio analysis if describeExecution and getExecutionHistory is successful', function(done) {
            console.log(excution_history_response);
            input.file_type = 'mp3';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/audio.mp3";
            input.file_name = "audio.mp3";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "COMPLETE";
            excution_history_response.events[0].executionStartedEventDetails.input = '{"file_type": "mp3"}';

            let completed_audio = {
                state_machine_status: "COMPLETE",
                analysis: {
                    transcript: "COMPLETE",
                    entities: "COMPLETE",
                    phrases: "COMPLETE"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, excution_history_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(completed_audio));
                    done();
                }
            });

        });

        it('should return state machine still in progress for audio analysis if stateExitedEventDetails are not available', function(done) {

            input.file_type = 'mp3';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/audio.mp3";
            input.file_name = "audio.mp3";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "IN PROGRESS";

            let in_progress_response = {};
            in_progress_response['events'] = [];
            in_progress_response['events'][0] = {
                timestamp: "timestamp",
                executionStartedEventDetails: {
                    input: '{"file_type": "mp3"}',
                },
                type: "ExecutionStarted"
            };

            let in_progress_audio = {
                state_machine_status: "IN PROGRESS",
                analysis: {
                    transcript: "IN PROGRESS",
                    entities: "IN PROGRESS",
                    phrases: "IN PROGRESS"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, in_progress_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(in_progress_audio));
                    done();
                }
            });

        });

        it('should return state machine progress for video analysis if describeExecution and getExecutionHistory is successful', function(done) {

            input.file_type = 'mov';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/video.mov";
            input.file_name = "video.mov";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "COMPLETE";
            excution_history_response.events[0].executionStartedEventDetails.input = '{"file_type": "mov"}';

            let completed_video = {
                state_machine_status: "COMPLETE",
                analysis: {
                    labels: "COMPLETE",
                    faces: "COMPLETE",
                    celebs: "COMPLETE",
                    persons: "COMPLETE",
                    face_matches: "COMPLETE"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, excution_history_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(completed_video));
                    done();
                }
            });

        });

        it('should return state machine still in progress for video analysis if stateExitedEventDetails are not available', function(done) {

            input.file_type = 'mov';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/video.mov";
            input.file_name = "video.mov";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "IN PROGRESS";

            let in_progress_response = {};
            in_progress_response['events'] = [];
            in_progress_response['events'][0] = {
                timestamp: "timestamp",
                executionStartedEventDetails: {
                    input: '{"file_type": "mov"}',
                },
                type: "ExecutionStarted"
            };

            let in_progress_video = {
                state_machine_status: "IN PROGRESS",
                analysis: {
                    labels: "IN PROGRESS",
                    faces: "IN PROGRESS",
                    celebs: "IN PROGRESS",
                    persons: "IN PROGRESS",
                    face_matches: "IN PROGRESS"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, in_progress_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(in_progress_video));
                    done();
                }
            });

        });

        it('should return state machine progress for mp4 analysis if describeExecution and getExecutionHistory is successful', function(done) {

            input.file_type = 'mp4';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/video.mp4";
            input.file_name = "video.mp4";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "COMPLETE";
            excution_history_response.events[0].executionStartedEventDetails.input = '{"file_type": "mp4"}';

            let completed_mp4 = {
                state_machine_status: "COMPLETE",
                analysis: {
                    labels: "COMPLETE",
                    faces: "COMPLETE",
                    celebs: "COMPLETE",
                    persons: "COMPLETE",
                    face_matches: "COMPLETE",
                    transcript: "COMPLETE",
                    entities: "COMPLETE",
                    phrases: "COMPLETE"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, excution_history_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(completed_mp4));
                    done();
                }
            });

        });

        it('should return state machine still in progress for mp4 analysis if stateExitedEventDetails are not available', function(done) {

            input.file_type = 'mp4';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/video.mp4";
            input.file_name = "video.mp4";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "IN PROGRESS";

            let in_progress_response = {};
            in_progress_response['events'] = [];
            in_progress_response['events'][0] = {
                timestamp: "timestamp",
                executionStartedEventDetails: {
                    input: '{"file_type": "mp4"}',
                },
                type: "ExecutionStarted"
            };

            let in_progress_mp4 = {
                state_machine_status: "IN PROGRESS",
                analysis: {
                    labels: "IN PROGRESS",
                    faces: "IN PROGRESS",
                    celebs: "IN PROGRESS",
                    persons: "IN PROGRESS",
                    face_matches: "IN PROGRESS",
                    transcript: "IN PROGRESS",
                    entities: "IN PROGRESS",
                    phrases: "IN PROGRESS"
                }
            };

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            AWS.mock('StepFunctions', 'getExecutionHistory', function(params, callback) {
                callback(null, in_progress_response);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    assert.equal(JSON.stringify(data), JSON.stringify(in_progress_mp4));
                    done();
                }
            });

        });

        it('should return state machine failure if describeExecution successfully returns a failure', function(done) {

            input.file_type = 'mp4';
            input.key = "private/us-east-1:56af0fcb-0b48-412c-8546-0d1e89431a74/media/033451416-a313-4d30-ae23-82da4cb3c89d/content/video.mp4";
            input.file_name = "video.mp4";
            execution_status.input = JSON.stringify(input);
            execution_status.status = "FAILED";

            AWS.mock('StepFunctions', 'describeExecution', function(params, callback) {
                callback(null, execution_status);
            });

            let _status = new Status();
            _status.getStatus(object_id, owner_id, function(err, data) {
                if (err) done(err);
                else {
                    console.log(data);
                    assert.equal(data.state_machine_status, "FAILED");
                    done();
                }
            });

        });

    });
});
