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

let https = require('https');

/**
 * Helper function to send anonymous solution configuration information.
 *
 * @class metricsHelper
 */
let metricsHelper = (function() {

    /**
     * @class metricsHelper
     * @constructor
     */
    let metricsHelper = function() {};

    /**
     * Sends anonymous solution configuration data.
     * @param {json} solution_config - anonymous solution configuration data
     * @param {sendAnonymousMetric~requestCallback} cb - The callback that handles the response.
     */
    metricsHelper.prototype.sendAnonymousMetric = function(solution_config, cb) {

        let _options = {
            hostname: 'metrics.awssolutionsbuilder.com',
            port: 443,
            path: '/generic',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        let request = https.request(_options, function(response) {
            let buffer;
            let data;

            response.on('data', function(chunk) {
                buffer += chunk;
            });

            response.on('end', function(err) {
                data = buffer;
                cb(null, data);
            });
        });

        if (solution_config) {
            request.write(JSON.stringify(solution_config));
        }

        request.end();

        request.on('error', (e) => {
            console.error(e);
            cb(['Error occurred when sending metric request.', JSON.stringify(_payload)].join(' '), null);
        });
    };

    return metricsHelper;

})();

module.exports = metricsHelper;
