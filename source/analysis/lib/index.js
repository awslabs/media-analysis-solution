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
let transcribe = require('./transcribe');
let mediaConvert = require('./media-convert');
let comprehend = require('./comprehend');
let image = require('./image');
let video = require('./video');
let steps = require('./steps');
let elasticsearch = require('./elasticsearch');
let collection = require('./collection');
const s3Bucket = process.env.S3_BUCKET;

module.exports.respond = function(event, cb) {

  /**
   * Triggered by S3 Put event
   */

   if (event.Records[0].eventSource == 'aws:s3'){
      let media_key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
      let media_formats = ['mov','mp4','jpeg','jpg','png','wav','wave','mp3','flac'];

      /**
       *  New media uploaded to be analyzed.
       *  Don't start state machine for metadata upload.
       */
       
      // 02/05/2019 - SIM:media-analysis-6 - handle media with no extension
      if (media_key.split('/')[4] == 'content' && !media_formats.includes(media_key.split('.').pop())){
          //console.log('unsupported media extension');
          return cb('unsupported media extension', null);
      }  
      
      if (media_key.split('/')[4] == 'content' && media_formats.includes(media_key.split('.').pop())) {
          console.log('New media uploaded:', JSON.stringify(event, null, 2));

          let event_info = {
              Records: [{"eventSource":"media-analysis"}],
              upload_time: event.Records[0].eventTime,
              key: media_key,
              file_type: media_key.split('.').pop(),
              size: event.Records[0].s3.object.size,
              owner_id: media_key.split('/')[1],
              object_id: media_key.split('/')[3],
              file_name: media_key.split('/').pop()
          };

          steps.respond(event_info, function(err, data) {
              if (err) {
                  return cb(err, null);
              }
              else {
                  //console.log(data);
                  return cb(null, data);
              }
          });
      }

      /**
       *  New image uploaded to be indexed
       */

      else if (media_key.split('/')[2] == 'collection') {
          console.log('New face(s) to be indexed:', JSON.stringify(event, null, 2));
          let event_info = {
              CollectionId: media_key.split('/')[1].replace(':','-'),
              DetectionAttributes: ['ALL'],
              ExternalImageId: media_key.split('/')[4],
              Image: {
                  S3Object: {
                      Bucket: s3Bucket,
                      Name: media_key
                  }
              }
          };

          collection.respond(event_info, function(err, data) {
              if (err) {
                  return cb(err, null);
              }
              else {
                  return cb(null, data);
              }
          });
      }
   }

   /**
    * Triggered by Step Functions state machine task
    */

   else if (event.Records[0].eventSource == 'media-analysis') {

        /**
         * Initial state, merge default ai_options.<type> with the payload
         */
       if (event.lambda === undefined) {
            let merged = Object.assign({
                ai_options: {
                    labels: true,
                    celebs: true,
                    faces: true,
                    face_matches: true,
                    persons: true,
                    transcript: true,
                    entities: true,
                    phrases: true,
                    language_code: 'en-US',
                },
            }, event);

            console.log(`original: ${JSON.stringify(event, null, 2)}, merged = ${JSON.stringify(merged, null, 2)}`)
            return cb(null, merged);
       }
       else if (event.lambda.service_name == 'image'){
           image.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
       else if (event.lambda.service_name == 'video'){
           video.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
       else if (event.lambda.service_name == 'transcribe'){
           transcribe.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
       else if (event.lambda.service_name == 'media_convert'){
           mediaConvert.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
       else if (event.lambda.service_name == 'comprehend'){
           comprehend.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
       else if (event.lambda.service_name == 'elasticsearch'){
           elasticsearch.respond(event, function(err, data) {
               if (err) {
                   return cb(err, null);
               }
               else {
                   return cb(null, data);
               }
           });
       }
   }
};
