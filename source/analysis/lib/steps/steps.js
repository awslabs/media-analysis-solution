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
let uuid = require('uuid')

const stateMachine = process.env.STATE_MACHINE;

/**
 * Starts media analysis using
 * Amazon Step Functions.
 *
 * @class steps
 */

 let steps = (function() {

   /**
    * @class steps
    * @constructor
    */
    let steps = function() {};

    /**
     * Starts media analysis state machine
     * @param {JSON} event_info - information about the media to be analyzed
     * @param {startStateMachine~callback} cb - The callback that handles the response.
     */

     steps.prototype.startStateMachine = function(event_info, cb) {

        let params = {
            stateMachineArn: stateMachine,
            input: JSON.stringify(event_info),
            name: event_info.object_id
        };

        let step = new AWS.StepFunctions();
        step.startExecution(params, function(err, data) {
            if (err) {
              //BUGFIX/media-analysis-35 adding a repeat step in if the exectuion id already exsits
              if (err.code === 'ExecutionAlreadyExists') {
                params.name = uuid.v4()
                step.startExecution(params, function(err, data) {
                  if (err) {
                    console.log(err);
                    return cb(err, null);
                  } else {
                    return cb(null, data);
                  }
                })
              } else {
                console.log(err);
                return cb(err, null);
              }
              //BUGFIX
            }
            else {
                return cb(null, data);
            }
        });
     };

    return steps;

 })();

 module.exports = steps;
