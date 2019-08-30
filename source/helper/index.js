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

console.log('Loading function');
let eshelper = require('./lib/eshelper.js');
let s3helper = require('./lib/s3helper.js');
let metricsHelper = require('./lib/metricsHelper.js');
let https = require('https');
let url = require('url');
let uuidv4 = require('uuid/v4');
let moment = require('moment');

exports.handler = function(event, context, callback) {
    console.log(event);

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
        if (event.ResourceProperties.customAction === 'sendConfig') {
            let _metricsHelper = new metricsHelper();

            let solution_config = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.uuid,
                TimeStamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
                Data: {
                    Version: event.ResourceProperties.version,
                    Deleted: moment().utc().format(),
                    Size: event.ResourceProperties.size,
                    Metrics: event.ResourceProperties.metrics
                }
            };

            _metricsHelper.sendAnonymousMetric(solution_config, function(err, data) {
                if (err) {
                    console.log(err);
                    responseData = {
                        Error: 'Sending anonymous delete metric failed'
                    };
                } else {
                    responseStatus = 'SUCCESS';
                }

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        }
        else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS', responseData);
        }

    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'createIndex') {
            let _eshelper = new eshelper();

            _eshelper.createIndex(event.ResourceProperties.clusterUrl, event.ResourceProperties.es_index, event.ResourceProperties.es_version, function(err, data) {
                if (err) {
                    console.log(err);
                    let responseData = {
                      Error: 'Creating the index failed'
                    };
                }
                else {
                  console.log(data);
                  responseStatus = 'SUCCESS';
                }

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        }
        else if (event.ResourceProperties.customAction === 'createUuid') {
                console.log('Generating UUID');
                responseData = {uuid: uuidv4()};
                responseStatus = 'SUCCESS';

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        }
        else if (event.ResourceProperties.customAction === 'sendConfig') {
                let _metricsHelper = new metricsHelper();

                let solution_config = {
                    Solution: event.ResourceProperties.solutionId,
                    UUID: event.ResourceProperties.uuid,
                    TimeStamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
                    Data: {
                        Version: event.ResourceProperties.version,
                        Launch: moment().utc().format(),
                        Size: event.ResourceProperties.size,
                        Metrics: event.ResourceProperties.metrics
                    }
                };

                _metricsHelper.sendAnonymousMetric(solution_config, function(err, data) {
                    if (err) {
                        console.log(err);
                        responseData = {
                            Error: 'Sending anonymous launch metric failed'
                        };
                    } else {
                        responseStatus = 'SUCCESS';
                    }

                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });
        }
        else if (event.ResourceProperties.customAction === 'copyS3assets') {
            let _s3helper = new s3helper();

            _s3helper.copyAssets(event.ResourceProperties.manifestKey,
              event.ResourceProperties.sourceS3Bucket,
              event.ResourceProperties.sourceS3key,
              event.ResourceProperties.destS3Bucket, function(err, data) {
                if (err) {
                    console.log(err);
                    let responseData = {
                      Error: 'Copying S3 assets failed'
                    };
                }
                else {
                    console.log(data);
                    responseStatus = 'SUCCESS';
                }

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        }
        else if (event.ResourceProperties.customAction === 'putConfig') {
            let media_analysis_config = {
                SOLUTION_REGION: event.ResourceProperties.REGION,
                SOLUTION_USERPOOLID: event.ResourceProperties.USERPOOLID,
                SOLUTION_USERPOOLWEBCLIENTID: event.ResourceProperties.USERPOOLWEBCLIENTID,
                SOLUTION_IDENTITYPOOLID: event.ResourceProperties.IDENTITYPOOLID,
                SOLUTION_BUCKET: event.ResourceProperties.BUCKET,
                SOLUTION_ENDPOINT: event.ResourceProperties.ENDPOINT,
                SOLUTION_CONSOLE_LINK: event.ResourceProperties.CONSOLE_LINK
            };
            let _content = `'use strict';\n\nconst media_analysis_config = ` + JSON.stringify(media_analysis_config) + ';';

            let _s3helper = new s3helper();
            _s3helper.putConfig(_content, event.ResourceProperties.destS3Bucket, event.ResourceProperties.destS3Key, function(err, data) {
                if (err) {
                    console.log(err);
                    let responseData = {
                      Error: 'Copying S3 assets failed'
                    };
                }
                else {
                    console.log(data);
                    responseStatus = 'SUCCESS';
                }

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        }
    }

    if (event.RequestType === 'Update') {
        if (event.ResourceProperties.customAction === 'copyS3assets') {
            let _s3helper = new s3helper();

            _s3helper.copyAssets(event.ResourceProperties.manifestKey,
              event.ResourceProperties.sourceS3Bucket,
              event.ResourceProperties.sourceS3key,
              event.ResourceProperties.destS3Bucket, function(err, data) {
                if (err) {
                    console.log(err);
                    let responseData = {
                      Error: 'Copying S3 assets failed'
                    };
                }
                else {
                    console.log(data);
                    responseStatus = 'SUCCESS';
                }

                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
            });
        }
        else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS', responseData);
        }
    }
};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};
