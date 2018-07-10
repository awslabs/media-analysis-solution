/*********************************************************************************************************************
 *  Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

/**
 * @author Solution Builders
 */

'use strict';

let AWS = require('aws-sdk');
let upload = require('./../upload');
let request = require('request');
let creds = new AWS.EnvironmentCredentials('AWS');

const s3Bucket = process.env.S3_BUCKET;

/**
 * Performs operations for audio transcription using
 * Amazon Transcribe.
 *
 * @class transcribe
 */

 let transcribe = (function() {

   /**
    * @class transcribe
    * @constructor
    */
    let transcribe = function() {};

    /**
     * Starts audio transcription job
     * @param {JSON} event_info - information about the audio file
     * @param {startTranscription~callback} cb - The callback that handles the response.
     */

     transcribe.prototype.startTranscription = function(event_info, cb) {
        console.log('Executing audio transcription');

        let job_name = [event_info.object_id,'transcription'].join('_');

        let media_file_uri = '';
        if (process.env.AWS_REGION == 'us-east-1'){
            media_file_uri = ['https://s3.amazonaws.com',s3Bucket,event_info.key].join('/');
        }
        else {
            media_file_uri = ['https://s3-',process.env.AWS_REGION,'.amazonaws.com/',s3Bucket,'/',event_info.key].join('');
        }

        let params = {
            LanguageCode: 'en-US',
            Media: {
                MediaFileUri: media_file_uri
            },
            MediaFormat: event_info.file_type,
            TranscriptionJobName: job_name
         };

         let transcribe = new AWS.TranscribeService();
         transcribe.startTranscriptionJob(params, function(err, data) {

           // 07.02.2018 - Prevents infinite loop when transcribe job doesn't start
           // If the transcription job returns an error, pass it on to the state machine.
           if (err) {
             let resp = {
               jobDidStart: false,
               err: err
             };

             return cb(resp, null);
           }

           // 07.02.2018 - Prevents infinite loop when transcribe job doesn't start
           // Otherwise, return information about the job to the state machine.
           else {
             let resp = {
               jobDidStart: true,
               jobName: data.TranscriptionJob.TranscriptionJobName
             }

             return cb(null, resp);
           }
         });
     };

     /**
      * Gets status of audio transcription job
      * @param {JSON} event_info - information about the transcription job
      * @param {getStatus~callback} cb - The callback that handles the response.
      */

      transcribe.prototype.getStatus = function(event_info, cb) {
         console.log('Getting transcription job status');

         let params = {
             TranscriptionJobName: event_info.transcribe.jobName
          };

          let transcribe = new AWS.TranscribeService();
          transcribe.getTranscriptionJob(params, function(err, data) {

              if (err) {
                return cb(err, null);
              }
              else {

                // 07.02.2018 - Prevents infinite loop when transcribe job doesn't start
                // Assigns transcription job status to variable to simplify function return statement.
                let jobStatus = data.TranscriptionJob.TranscriptionJobStatus;

                if (jobStatus == 'FAILED' && event_info.file_type == 'mp4') {
                    jobStatus = 'MP4 FAILED';
                }

                return cb(null, jobStatus);
              }
          });
      };

      /**
       * Gets results of audio transcription job
       * @param {JSON} event_info - information about the transcription job
       * @param {getResults~callback} cb - The callback that handles the response.
       */

       transcribe.prototype.getResults = function(event_info, cb) {
          console.log('Getting results of transcription job');

          let params = {
              TranscriptionJobName: event_info.transcribe.jobName
           };

           let transcribe = new AWS.TranscribeService();
           transcribe.getTranscriptionJob(params, function(err, data) {
               if (err) {
                 return cb(err, null);
               }
               else {
                 if (data.TranscriptionJob.TranscriptionJobStatus == 'FAILED' && event_info.file_type == 'mp4') {
                      let mp4_failed_transcript = {
                       jobName: event_info.transcribe.jobName,
                       results: {
                         transcripts: [{
                           transcript: ['Transcription Failed: ', data.TranscriptionJob.FailureReason].join(' ')
                         }],
                         items: []
                       },
                       status: 'MP4 FAILED'
                     };
                     let transcript_json = mp4_failed_transcript;
                     let transcript_key = ['private',event_info.owner_id,'media',event_info.object_id,'results','transcript.json'].join('/');
                     let s3_params = {
                         Bucket: s3Bucket,
                         Key: transcript_key,
                         Body: JSON.stringify(transcript_json),
                         ContentType: 'application/json'
                     };

                     upload.respond(s3_params, function(err, data) {
                         if (err){
                           return cb(err, null);
                         }
                         else {
                           let transcript_response = {'key': transcript_key, 'status': 'COMPLETE'};
                           return cb(null,transcript_response);
                         }
                     });
                 }
                 else {
                     request(data.TranscriptionJob.Transcript.TranscriptFileUri, function(err, data, body) {
                         if (err) {
                             return cb(err, null);
                         }
                         else {
                            let transcript_json = JSON.parse(body);
                            let transcript_key = ['private',event_info.owner_id,'media',event_info.object_id,'results','transcript.json'].join('/');
                            let s3_params = {
                                Bucket: s3Bucket,
                                Key: transcript_key,
                                Body: JSON.stringify(transcript_json),
                                ContentType: 'application/json'
                            };

                            upload.respond(s3_params, function(err, data) {
                                if (err){
                                  return cb(err, null);
                                }
                                else {
                                  let transcript_response = {'key': transcript_key, 'status': 'COMPLETE'};
                                  return cb(null,transcript_response);
                                }
                            });
                         }
                     });
                 }
               }
           });
       };

    return transcribe;

 })();

 module.exports = transcribe;
