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
     * @param {JSON} audio_info - information about the audio file
     * @param {startTranscription~callback} cb - The callback that handles the response.
     */

     transcribe.prototype.startTranscription = function(audio_info, cb) {
        console.log('Executing audio transcription');

        let job_name = [audio_info.object_id,'transcription'].join('_');

        let media_file_uri = '';
        if (process.env.AWS_REGION == 'us-east-1'){
            media_file_uri = ['https://s3.amazonaws.com',s3Bucket,audio_info.key].join('/');
        }
        else {
            media_file_uri = ['https://s3-',process.env.AWS_REGION,'.amazonaws.com/',s3Bucket,'/',audio_info.key].join('');
        }

        console.log(media_file_uri);
        let params = {
            LanguageCode: 'en-US',
            Media: {
                MediaFileUri: media_file_uri
            },
            MediaFormat: audio_info.file_type,
            TranscriptionJobName: job_name
         };

         let transcribe = new AWS.TranscribeService();
         transcribe.startTranscriptionJob(params, function(err, data) {
             if (err) {
               return cb(err, null);
             }
             else {
               return cb(null, job_name);
             }
         });
     };

     /**
      * Gets status of audio transcription job
      * @param {JSON} audio_info - information about the transcription job
      * @param {getStatus~callback} cb - The callback that handles the response.
      */

      transcribe.prototype.getStatus = function(audio_info, cb) {
         console.log('Getting transcription job status');


         let params = {
             TranscriptionJobName: audio_info.transcribe.job_name
          };

          let transcribe = new AWS.TranscribeService();
          transcribe.getTranscriptionJob(params, function(err, data) {
              if (err) {
                return cb(err, null);
              }
              else {
                /**
                *  State machine will handle mp4 transcription failures
                *  differently than other formats
                */
                if (data.TranscriptionJob.TranscriptionJobStatus == 'FAILED' && audio_info.file_type == 'mp4') {
                    return cb(null, 'MP4 FAILED');
                }
                else {
                    return cb(null, data.TranscriptionJob.TranscriptionJobStatus);
                }
              }
          });
      };

      /**
       * Gets results of audio transcription job
       * @param {JSON} audio_info - information about the transcription job
       * @param {getResults~callback} cb - The callback that handles the response.
       */

       transcribe.prototype.getResults = function(audio_info, cb) {
          console.log('Getting results of transcription job');

          let params = {
              TranscriptionJobName: audio_info.transcribe.job_name
           };

           let transcribe = new AWS.TranscribeService();
           transcribe.getTranscriptionJob(params, function(err, data) {
               if (err) {
                 return cb(err, null);
               }
               else {
                 if (data.TranscriptionJob.TranscriptionJobStatus == 'FAILED' && audio_info.file_type == 'mp4') {
                      let mp4_failed_transcript = {
                       jobName: audio_info.transcribe.job_name,
                       results: {
                         transcripts: [{
                           transcript: ['Transcription Failed: ', data.TranscriptionJob.FailureReason].join(' ')
                         }],
                         items: []
                       },
                       status: 'MP4 FAILED'
                     };
                     let transcript_json = mp4_failed_transcript;
                     let transcript_key = ['private',audio_info.owner_id,'media',audio_info.object_id,'results','transcript.json'].join('/');
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
                            let transcript_key = ['private',audio_info.owner_id,'media',audio_info.object_id,'results','transcript.json'].join('/');
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
