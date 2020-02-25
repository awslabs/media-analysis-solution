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

const s3Bucket = process.env.S3_BUCKET;

/**
 * Uploads response data to S3
 *
 * @class uplaod
 */

 let upload = (function() {

   /**
    * @class upload
    * @constructor
    */
    let upload = function() {};

    /**
     * Performs upload to S3
     * @param {JSON} params - parameters for the S3 upload
     * @param {uploadFile~callback} cb - The callback that handles the response.
     */

     upload.prototype.uploadFile = function(params, cb) {
        let s3 = new AWS.S3();
        s3.upload(params, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                return cb(null,'Successfully uploaded file to S3');
            }
        });
     };

    return upload;

 })();

 module.exports = upload;
