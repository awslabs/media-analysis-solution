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
let Transcribe = require('./transcribe.js');

module.exports.respond = function(event, cb) {
    let _transcribe = new Transcribe();

    if (event.lambda.function_name == 'start_transcription') {
        _transcribe.startTranscription(event, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    if (event.lambda.function_name == 'get_status') {
        _transcribe.getStatus(event, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    if (event.lambda.function_name == 'get_results') {
        _transcribe.getResults(event, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
};
