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

/**
 * Helper function to interact with ElasticSearch Service on behalf of a
 * cfn custom resource
 *
 * @class eshelper
 */
let eshelper = (function() {

    /**
     * @class eshelper
     * @constructor
     */
    let eshelper = function() {};

    /**
     * Creates index in Amazon ElasticSearch
     * @param {string} endpoint - The Elasticsearch cluster endpoint
     * @param {string} es_index - The Elasticsearch index
     * @param {createIndex~callback} cb - The callback that handles the response
     */
    eshelper.prototype.createIndex = function(endpoint, es_index, es_version, cb) {

        console.log('Creating index:', es_index);

        let client = require('elasticsearch').Client({
            hosts: endpoint,
            connectionClass: require('http-aws-es'),
            apiVersion: es_version
        });

        client.indices.create({
            index: es_index
        }, function(err, resp) {
            if (err) {
                return cb(err, null);
            } else {
                return cb(null, resp);
            }
        });
    };

    return eshelper;

})();

module.exports = eshelper;
