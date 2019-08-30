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
let PATH = require('path');
let crypto = require('crypto');
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

        let key = event_info.key;
        let {
          ext,
        } = PATH.parse(event_info.key);
        let filetype = ext.slice(1);
        let language_code = (event_info.ai_options || {}).language_code || 'en-US';

        let media_file_uri = '';
        if (process.env.AWS_REGION == 'us-east-1'){
            media_file_uri = ['https://s3.amazonaws.com',s3Bucket,key].join('/');
        }
        else {
            media_file_uri = ['https://s3-',process.env.AWS_REGION,'.amazonaws.com/',s3Bucket,'/',key].join('');
        }
        console.log('File:: ',media_file_uri,' type:: ',filetype, 'language_code:: ', language_code);

        let params = {
            LanguageCode: language_code,
            Media: {
                MediaFileUri: media_file_uri
            },
            MediaFormat: filetype,
            TranscriptionJobName: this.generateJobName(event_info)
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

        let _getStatus = (resolve) => {
          let params = {
            TranscriptionJobName: event_info.transcribe.jobName
          };

          let transcribe = new AWS.TranscribeService();

          transcribe.getTranscriptionJob(params, function(err, data) {
            if (err) {
              return Promise.reject(err);
            }
            else {
              // 07.02.2018 - Prevents infinite loop when transcribe job doesn't start
              // Assigns transcription job status to variable to simplify function return statement.
              let jobStatus = data.TranscriptionJob.TranscriptionJobStatus;

              if (jobStatus == 'FAILED' && event_info.file_type == 'mp4') {
                  jobStatus = 'MP4 FAILED';
              }
              return resolve(jobStatus);
            }
          });
        };

        return this.retry(4, _getStatus, 200)
          .then(result => cb(null, result))
          .catch(e => cb(e, null));
      };

      /**
       * Gets results of audio transcription job
       * @param {JSON} event_info - information about the transcription job
       * @param {getResults~callback} cb - The callback that handles the response.
       */

      transcribe.prototype.getResults = function(event_info, cb) {
        console.log('Getting results of transcription job');

        let _getResults = (resolve) => {
          let params = {
            TranscriptionJobName: event_info.transcribe.jobName
          };

          let transcribe = new AWS.TranscribeService();
          transcribe.getTranscriptionJob(params, function(err, data) {
              if (err) {
                return Promise.reject(err);
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
                          return Promise.reject(err);
                        }
                        else {
                          let transcript_response = {'key': transcript_key, 'status': 'COMPLETE'};
                          return resolve(transcript_response);
                        }
                    });
                }
                else {
                    request(data.TranscriptionJob.Transcript.TranscriptFileUri, function(err, data, body) {
                        if (err) {
                          return Promise.reject(err);
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
                                return Promise.reject(err);
                              }
                              else {
                                let transcript_response = {'key': transcript_key, 'status': 'COMPLETE'};
                                return resolve(transcript_response);
                              }
                          });
                        }
                    });
                }
              }
          });
        };

        return this.retry(4, _getResults, 200)
          .then(result => cb(null, result))
          .catch(e => cb(e, null));
      };

       transcribe.prototype.generateJobName = function(event_info) {
         return `${event_info.object_id}_${crypto.randomBytes(8).toString('hex')}_transcription`
       }

       transcribe.prototype.pause = function(duration) {
         return new Promise(res =>
           setTimeout(res, duration));
       }

       transcribe.prototype.retry = function(retries, fn, delay = 0) {
         let promise = new Promise(res => fn(res));

         return promise.catch((e) => {
           console.log(`transcribe.${fn.name} caught error ${e.message}, retry in ${delay}s (${retries} retries left)...`);

           if (retries > 0) {
             return this.pause(delay).then(() =>
               this.retry(retries - 1, fn, delay * 2));
           }

           return Promise.reject(e);
         });
       }
    return transcribe;

 })();

 module.exports = transcribe;
