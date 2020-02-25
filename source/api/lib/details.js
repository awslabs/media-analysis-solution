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

const endpoint = process.env.DOMAIN_ENDPOINT;
const es_index = process.env.ES_INDEX;
const es_version = process.env.ES_VERSION;

/**
 * Gets details for a specific document stored in Amazon ElasticSearch
 *
 * @class details
 */
let details = (function() {

    /**
     * @class details
     * @constructor
     */
    let details = function() {};

    /**
     * Gets details for a specific document stored in Amazon ElasticSearch.
     * @param {string} object_id - id document to be retrieved
     * @param {string} owner_id - Cognito Identity Id of the requester
     * @param {getDocument~callback} cb - The callback that handles the response
     */
    details.prototype.getDocument = function(object_id, owner_id, cb) {
        console.log('Getting document for id: ', object_id);

        let client = require('elasticsearch').Client({
            hosts: endpoint,
            connectionClass: require('http-aws-es'),
            amazonES: {
                region: process.env.AWS_REGION,
                credentials: creds
            },
            apiVersion: es_version
        });

        client.get({
            index: es_index,
            type: 'media',
            id: object_id
        }).then(function(body) {
            console.log(body);
            let output = {};
            if (body._source.owner_id == owner_id) {
              output = {
                  object_id: body._source.object_id,
                  details: {
                    upload_time: body._source.upload_time,
                    bucket: body._source.bucket,
                    key: body._source.key,
                    file_type: body._source.file_type,
                    size: body._source.size,
                    filename: body._source.name
                  }
              };
              cb(null, output);
            }
            else {
              cb('User does not have access',null);
            }
        }, function(error) {
            console.trace(error.message);
            cb(error, null);
        });

    };

    return details;

})();

module.exports = details;
