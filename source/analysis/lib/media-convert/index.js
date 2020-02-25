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
let MediaConvert = require('./media-convert.js');

module.exports.respond = function(event, cb) {
    let _mediaConvert = new MediaConvert();

    if (event.lambda.function_name == 'start_media_convert') {
        _mediaConvert.createJob(event, (err, data) => {
            if (err) {
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
    if (event.lambda.function_name == 'get_status') {
        _mediaConvert.getJobStatus(event, (err, data) => {
            if (err) {
                return cb(err, null);
            }
            else {
                return cb(null, data);
            }
        });
    }
};
