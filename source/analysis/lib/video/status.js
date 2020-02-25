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
 * Gets status of video analysis job from
 * Amazon Rekognition.
 *
 * @class status
 */

 let status = (function() {

   /**
    * @class status
    * @constructor
    */
    let status = function() {};

    /**
     * Gets status of video analysis job from Amazon Rekognition
     * @param {JSON} video_info - information about the video analysis
     * @param {getStatus~callback} cb - The callback that handles the response.
     */

     status.prototype.getStatus = function(video_info, cb) {
        let params = {
            JobId: video_info.video.job_id
        }

        let rekognition = new AWS.Rekognition();
        if (video_info.video.job_tag.split('_').pop() == 'labels'){
            rekognition.getLabelDetection(params, function(err, data) {
                if (err){
                    console.log(err);
                    return cb(err, null);
                }
                else {
                    return cb(null,data.JobStatus);
                }
            });
        }
        else if (video_info.video.job_tag.split('_').pop() == 'celebs'){
            rekognition.getCelebrityRecognition(params, function(err, data) {
                if (err){
                    console.log(err);
                    return cb(err, null);
                }
                else {
                    return cb(null,data.JobStatus);
                }
            });
        }
        else if (video_info.video.job_tag.split('_').pop() == 'faces'){
            rekognition.getFaceDetection(params, function(err, data) {
                if (err){
                    console.log(err);
                    return cb(err, null);
                }
                else {
                    return cb(null,data.JobStatus);
                }
            });
        }
        else if (video_info.video.job_tag.split('_').pop() == 'persons'){
            rekognition.getPersonTracking(params, function(err, data) {
                if (err){
                    console.log(err);
                    return cb(err, null);
                }
                else {
                    return cb(null,data.JobStatus);
                }
            });
        }
        else if (video_info.video.job_tag.split('_').pop() == 'facesearch'){
            if (video_info.video.job_id == 'NO COLLECTION') {
                return cb(null,'NO COLLECTION');
            }
            else {
                rekognition.getFaceSearch(params, function(err, data) {
                    if (err){
                        console.log(err);
                        return cb(err, null);
                    }
                    else {
                        return cb(null,data.JobStatus);
                    }
                });
            }
        }
     };

    return status;

 })();

 module.exports = status;
