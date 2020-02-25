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
let ElasticSearch = require('./elasticsearch.js');
let MetricsHelper = require('./../metricsHelper');

const s3Bucket = process.env.S3_BUCKET;
const solution_id = process.env.SOLUTIONID;
const uuid = process.env.UUID;


module.exports.respond = function(event, cb) {

    if (event.lambda.function_name == 'index_doc') {
        let doc = {
          upload_time: event.upload_time,
          bucket: s3Bucket,
          key: event.key,
          file_type: event.file_type,
          size: event.size,
          object_id: event.object_id,
          owner_id: event.owner_id,
          name: event.file_name
        };

        if (event.hasOwnProperty('duration')) {
            doc['duration'] = event.duration;
        }

        let branches = event.final_metadata;
        for (var branch in branches) {
            for (var b in branches[branch]) {
                for (var result in branches[branch][b].results) {
                    doc[result] = branches[branch][b].results[result];
                    if (branches[branch][b].results[result].hasOwnProperty('duration')) {
                        doc['duration'] = branches[branch][b].results[result].duration;
                    }
                }
            }
        }

        let _elasticsearch = new ElasticSearch();
        _elasticsearch.indexDocument(doc, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                let metric_params = {
                    'Solution': solution_id,
                    'UUID': uuid,
                    'TimeStamp': event.upload_time,
                    Data: {
                        'Format': event.file_type,
                        'Size': event.size
                    }
                };

                if (doc.hasOwnProperty('duration')) {
                    metric_params.Data['Duration'] = doc.duration;
                }
                MetricsHelper.respond(metric_params, function(error, response) {
                    if (error) {
                        console.log(error);
                        return cb(null,data);
                    }
                    else {
                        console.log(response);
                        return cb(null,data);
                    }
                });
            }
        });
    }
};
