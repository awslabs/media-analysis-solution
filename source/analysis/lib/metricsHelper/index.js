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
let metricsHelper = require('./metricsHelper.js');

const metrics = process.env.METRICS;

module.exports.respond = function(event, cb) {

    if (metrics == 'Yes') {
        let _metricsHelper = new metricsHelper();
        _metricsHelper.sendAnonymousMetric(event,function(err, data) {
            if (err) {
                console.log(err);
                return cb('Error sending anonymous metric', null);
            }
            else {
                console.log(data);
                return cb(null, 'Successfully sent anonymous metric');
            }
        });
    }
    else {
        return cb('Customer has elected not to send anonymous metrics', null);
    }

};
