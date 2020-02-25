/********************************************************************************************************************* 
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           * 
 *                                                                                                                    * 
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    * 
 *  with the License. A copy of the License is located at                                                             * 
 *                                                                                                                    * 
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    * 
 *                                                                                                                    * 
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES * 
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    * 
 *  and limitations under the License.                                                                                * 
 *********************************************************************************************************************/ 
 
/** 
 * @author Solution Builders 
 */ 

'use strict';

let AWS = require('aws-sdk');

let creds = new AWS.EnvironmentCredentials('AWS');
let state_machine = process.env.STATE_MACHINE;

/**
 * Gets status of state machine
 *
 * @class status
 */
let status = (function() {

    /**
     * @class status
     * @constructor
     */
    let status = function() {};

    /**
     * Gets status of state machine tasks
     * @param {string} object_id - UUID of the media being analyzed.
     * @param {string} owner_id - Media owner's Cognito identity ID.
     * @param {getStatus~requestCallback} cb - The callback that handles the response.
     */
    status.prototype.getStatus = function(object_id, owner_id, cb) {

      console.log('getting status for: \'' + object_id + '\'');

      var execution_arn = [state_machine.replace('stateMachine','execution'),object_id].join(':');
      var params = {
        executionArn: execution_arn
      };

      var steps = new AWS.StepFunctions();
      steps.describeExecution({'executionArn': execution_arn}, function(err, data) {
          if (err) {
              console.log('Error describing State Machine.');
              return cb(err, null);
          }
          else {
              var execution_status = data.status;
              console.log('State Machine status: ' + execution_status);
              if (JSON.parse(data.input).owner_id == owner_id) {
                  if (execution_status != 'FAILED' && execution_status != 'TIMED_OUT' && execution_status != 'ABORTED') {
                      getExecutionDetails(params, [], function(error, response) {
                          if (error) {
                              console.log('Error retrieving State Machine execution details.');
                              return cb(error, null);
                          }
                          else {
                              console.log('Successfully retrieved state machine execution details');
                              console.log(response);
                              var format = JSON.parse(response[0].executionStartedEventDetails.input).file_type;

                              if (format == 'mp3' || format == 'wav' || format == 'wave' || format == 'flac') {
                                  var audio_status_out = {
                                      'state_machine_status': execution_status,
                                      'analysis': {
                                          'transcript': 'IN PROGRESS',
                                          'entities': 'IN PROGRESS',
                                          'phrases': 'IN PROGRESS'
                                      }
                                  };
                                  for (var i in response) {
                                      if ('stateExitedEventDetails' in response[i]) {
                                          if (response[i].stateExitedEventDetails.name == 'Get Results') {
                                              audio_status_out.analysis.transcript = JSON.parse(response[i].stateExitedEventDetails.output).results.transcript.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Phrases') {
                                              audio_status_out.analysis.phrases = JSON.parse(response[i].stateExitedEventDetails.output).results.phrases.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Entities') {
                                              audio_status_out.analysis.entities = JSON.parse(response[i].stateExitedEventDetails.output).results.entities.status;
                                          }
                                      }
                                  }
                                  return cb(null, audio_status_out);
                              }
                              else if (format == 'mp4') {
                                  var mp4_status_out = {
                                      'state_machine_status': execution_status,
                                      'analysis': {
                                          'labels': 'IN PROGRESS',
                                          'faces': 'IN PROGRESS',
                                          'celebs': 'IN PROGRESS',
                                          'persons': 'IN PROGRESS',
                                          'face_matches': 'IN PROGRESS',
                                          'transcript': 'IN PROGRESS',
                                          'entities': 'IN PROGRESS',
                                          'phrases': 'IN PROGRESS'
                                      }
                                  };
                                  for (var i in response) {
                                      if ('stateExitedEventDetails' in response[i]) {
                                          if (response[i].stateExitedEventDetails.name == 'Get Label Results') {
                                              mp4_status_out.analysis.labels = JSON.parse(response[i].stateExitedEventDetails.output).results.labels.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Celeb Results') {
                                              mp4_status_out.analysis.celebs = JSON.parse(response[i].stateExitedEventDetails.output).results.celebs.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Face Results') {
                                              mp4_status_out.analysis.faces = JSON.parse(response[i].stateExitedEventDetails.output).results.faces.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Persons Results') {
                                              mp4_status_out.analysis.persons = JSON.parse(response[i].stateExitedEventDetails.output).results.persons.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Face-Match Results') {
                                              mp4_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Face-Match End') {
                                              mp4_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Results') {
                                              mp4_status_out.analysis.transcript = JSON.parse(response[i].stateExitedEventDetails.output).results.transcript.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Phrases') {
                                              mp4_status_out.analysis.phrases = JSON.parse(response[i].stateExitedEventDetails.output).results.phrases.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Entities') {
                                              mp4_status_out.analysis.entities = JSON.parse(response[i].stateExitedEventDetails.output).results.entities.status;
                                          }
                                      }
                                  }
                                  return cb(null, mp4_status_out);
                              }
                              else if (format == 'mov') {
                                  var mov_status_out = {
                                      'state_machine_status': execution_status,
                                      'analysis': {
                                          'labels': 'IN PROGRESS',
                                          'faces': 'IN PROGRESS',
                                          'celebs': 'IN PROGRESS',
                                          'persons': 'IN PROGRESS',
                                          'face_matches': 'IN PROGRESS'
                                      }
                                  };
                                  for (var i in response) {
                                      if ('stateExitedEventDetails' in response[i]) {
                                          if (response[i].stateExitedEventDetails.name == 'Get Label Results') {
                                              mov_status_out.analysis.labels = JSON.parse(response[i].stateExitedEventDetails.output).results.labels.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Celeb Results') {
                                              mov_status_out.analysis.celebs = JSON.parse(response[i].stateExitedEventDetails.output).results.celebs.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Face Results') {
                                              mov_status_out.analysis.faces = JSON.parse(response[i].stateExitedEventDetails.output).results.faces.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Persons Results') {
                                              mov_status_out.analysis.persons = JSON.parse(response[i].stateExitedEventDetails.output).results.persons.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Get Face-Match Results') {
                                              mov_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Face-Match End') {
                                              mov_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                      }
                                  }
                                  return cb(null, mov_status_out);
                              }
                              else if (format == 'png' || format == 'jpg' || format == 'jpeg') {
                                  var image_status_out = {
                                      'state_machine_status': execution_status,
                                      'analysis': {
                                          'labels': 'IN PROGRESS',
                                          'faces': 'IN PROGRESS',
                                          'celebs': 'IN PROGRESS',
                                          'face_matches': 'IN PROGRESS'
                                      }
                                  };
                                  for (var i in response) {
                                      if ('stateExitedEventDetails' in response[i]) {
                                          if (response[i].stateExitedEventDetails.name == 'Image-Get Labels') {
                                              image_status_out.analysis.labels = JSON.parse(response[i].stateExitedEventDetails.output).results.labels.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Image-Get Celebs') {
                                              image_status_out.analysis.celebs = JSON.parse(response[i].stateExitedEventDetails.output).results.celebs.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Image-Get Faces') {
                                              image_status_out.analysis.faces = JSON.parse(response[i].stateExitedEventDetails.output).results.faces.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Image-Get Face-Matches') {
                                              image_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                          else if (response[i].stateExitedEventDetails.name == 'Image-Face-Match End') {
                                              image_status_out.analysis.face_matches = JSON.parse(response[i].stateExitedEventDetails.output).results.face_matches.status;
                                          }
                                      }
                                  }
                                  console.log('returning ' + image_status_out);
                                  return cb(null, image_status_out);
                              }
                          }
                      });
                  }
              else {
                  console.log('State machine encountered an error');
                  return cb(null,{'state_machine_status':data.status});
              }
            }
          }
      });
    };

    let getExecutionDetails = function(params, results, cb) {
      var steps = new AWS.StepFunctions();
      steps.getExecutionHistory(params, function(err, data) {
          if (err) {
              return cb(err, null);
          }
          else {
              results.push.apply(results,data.events);
              if ('nextToken' in data) {
                  params.nextToken = data.nextToken;
                  getExecutionDetails(params, results, cb);
              }
              else {
                  return cb(null,results);
              }
          }
      });
    };

    return status;

})();

module.exports = status;
