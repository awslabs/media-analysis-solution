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
let upload = require('./../upload');

const s3Bucket = process.env.S3_BUCKET;

/**
 * Performs operations for video recognition actions using
 * Amazon Rekognition.
 *
 * @class video
 */

 let video = (function() {

   /**
    * @class video
    * @constructor
    */
    let video = function() {};

    /**
     * Recognizes labels in a video
     * @param {JSON} video_info - information about the video
     * @param {startLabels~callback} cb - The callback that handles the response.
     */

     video.prototype.startLabels = function(video_info, cb) {
        console.log('Executing video label detection');

        let job_tag = [video_info.object_id,'labels'].join('_');
        let rek_params = {
            Video: {
               S3Object: {
                 Bucket: s3Bucket,
                 Name: video_info.key
               }
            },
            JobTag: job_tag
         };

         let rekognition = new AWS.Rekognition();
         rekognition.startLabelDetection(rek_params, function(err, data) {
             if (err) {
               console.log(err);
               return cb(err, null);
             }
             else {
               let response = {'job_id': data.JobId, 'job_tag': job_tag};
               return cb(null, response);
             }
         });
     };

     /**
      * Focus persons in a video
      * @param {JSON} video_info - information about the video
      * @param {startPersons~callback} cb - The callback that handles the response.
      */

      video.prototype.startPersons = function(video_info, cb) {
         console.log('Executing video person focusing');

         let job_tag = [video_info.object_id,'persons'].join('_');
         let rek_params = {
             Video: {
                S3Object: {
                  Bucket: s3Bucket,
                  Name: video_info.key
                }
             },
             JobTag: job_tag
          };

          let rekognition = new AWS.Rekognition();
          rekognition.startPersonTracking(rek_params, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                let response = {'job_id': data.JobId, 'job_tag': job_tag};
                return cb(null, response);
              }
          });
      };

      /**
       * Recognizes celebrities in a video
       * @param {JSON} video_info - information about the video
       * @param {startCelebs~callback} cb - The callback that handles the response.
       */

       video.prototype.startCelebs = function(video_info, cb) {
          console.log('Executing video celebrity detection');

          let job_tag = [video_info.object_id,'celebs'].join('_');
          let rek_params = {
              Video: {
                 S3Object: {
                   Bucket: s3Bucket,
                   Name: video_info.key
                 }
              },
              JobTag: job_tag
           };

           let rekognition = new AWS.Rekognition();
           rekognition.startCelebrityRecognition(rek_params, function(err, data) {
               if (err) {
                 console.log(err);
                 return cb(err, null);
               }
               else {
                 let response = {'job_id': data.JobId, 'job_tag': job_tag};
                 return cb(null, response);
               }
           });
       };

       /**
        * Recognizes faces in a video
        * @param {JSON} video_info - information about the video
        * @param {startFaces~callback} cb - The callback that handles the response.
        */

        video.prototype.startFaces = function(video_info, cb) {
           console.log('Executing video face detection');

           let job_tag = [video_info.object_id,'faces'].join('_');
           let rek_params = {
               Video: {
                  S3Object: {
                    Bucket: s3Bucket,
                    Name: video_info.key
                  }
               },
               JobTag: job_tag,
               FaceAttributes: 'ALL'
            };

            let rekognition = new AWS.Rekognition();
            rekognition.startFaceDetection(rek_params, function(err, data) {
                if (err) {
                  console.log(err);
                  return cb(err, null);
                }
                else {
                  let response = {'job_id': data.JobId, 'job_tag': job_tag};
                  return cb(null, response);
                }
            });
        };

        /**
         * Matches faces in a video with known faces in a Rekognition collection
         * @param {JSON} video_info - information about the video
         * @param {startFaceSearch~callback} cb - The callback that handles the response.
         */

         video.prototype.startFaceSearch = function(video_info, cb) {
            console.log('Executing video face matching');

            let job_tag = [video_info.object_id,'facesearch'].join('_');
            let rek_params = {
                CollectionId: video_info.owner_id.replace(':','-'),
                Video: {
                   S3Object: {
                     Bucket: s3Bucket,
                     Name: video_info.key
                   }
                },
                JobTag: job_tag
             };

             let rekognition = new AWS.Rekognition();
             rekognition.startFaceSearch(rek_params, function(err, data) {
                 if (err) {
                     if (err.code == 'ResourceNotFoundException') {
                        console.log('Please upload a face image to create a collection');

                        let face_match_body = {
                            JobStatus: 'NO COLLECTION',
                            VideoMetadata:{},
                            Persons: []
                        };

                        let face_match_key = ['private',video_info.owner_id,'media',video_info.object_id,'results','face_matches.json'].join('/');

                        let s3_params = {
                           Bucket: s3Bucket,
                           Key: face_match_key,
                           Body: JSON.stringify(face_match_body),
                           ContentType: 'application/json'
                        };

                        upload.respond(s3_params, function(err, response) {
                            if (err){
                                console.log(err);
                                return cb(err, null);
                            }
                            else {
                                console.log(response);
                                let no_collection_response = {'job_id': 'NO COLLECTION', 'job_tag': job_tag};
                                return cb(null,no_collection_response);
                            }
                        });
                     }
                     else {
                       return cb(err, null);
                     }
                 }
                 else {
                   let response = {'job_id': data.JobId, 'job_tag': job_tag};
                   return cb(null, response);
                 }
             });
         };

    return video;

 })();

 module.exports = video;
