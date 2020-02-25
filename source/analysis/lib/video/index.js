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
let Video = require('./video.js');
let Results = require('./results.js');
let Status = require('./status.js');

module.exports.respond = function(event, cb) {
    let _video = new Video();
    let _results = new Results();
    let _status = new Status();

    if (event.lambda.function_name == 'start_labels') {
        _video.startLabels(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'start_celebs') {
        _video.startCelebs(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'start_faces') {
        _video.startFaces(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'start_persons') {
        _video.startPersons(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'start_face_search') {
        _video.startFaceSearch(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'check_status') {
        _status.getStatus(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    else if (event.lambda.function_name == 'get_results') {
        _results.getResults(event, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
};
