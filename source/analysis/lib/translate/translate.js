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
let PATH = require('path');
let crypto = require('crypto');
let AWS = require('aws-sdk');
let upload = require('../upload');
let request = require('request');
let creds = new AWS.EnvironmentCredentials('AWS');

const s3Bucket = process.env.S3_BUCKET;

/**
 * Performs operations for text translation using
 * Amazon Translate.
 *
 * @class translate
 */

 let translate = (function() {

   /**
    * @class translate
    * @constructor
    */
    let translate = function() {};

    /**
     * Starts text translation job
     * @param {JSON} event_info - information about the text file
     * @param {startTranslation~callback} cb - The callback that handles the response.
     */

     translate.prototype.startTranslation = function(event_info, cb) {
        console.log('Executing text translation');

        let key = event_info.key;
        let language_code = (event_info.ai_options || {}).language_code || 'en-US';
        let source_text = (event_info.ai_options || {}).source_text || '';
        let target_language_code = (event_info.ai_options || {}).target_language_code || 'es-US';

        let source_file_uri = '';
        if (process.env.AWS_REGION == 'us-east-1'){
            source_file_uri = ['https://s3.amazonaws.com',s3Bucket,key].join('/');
        }
        else {
            source_file_uri = ['https://s3-',process.env.AWS_REGION,'.amazonaws.com/',s3Bucket,'/',key].join('');
        }
        console.log('File:: ',source_file_uri, 'language_code:: ', language_code);

        // @todo: handle errors on `request()` call
        source_text = request(source_file_uri, function(err, data, body) {
            return body;
        });

        let params = {
            SourceLanguageCode: language_code,
            TargetLanguageCode: target_language_code,
            Text: source_text
         };

         let translate = new AWS.Translate();
         translate.translateText(params, function(err, data) {

           // 07.02.2018 - Prevents infinite loop when translate job doesn't start
           // If the translation job returns an error, pass it on to the state machine.
           if (err) {
             let resp = {
               jobDidStart: false,
               err: err
             };

             return cb(resp, null);
           }

           // 07.02.2018 - Prevents infinite loop when translate job doesn't start
           // Otherwise, return information about the job to the state machine.
           else {
             let resp = {
               jobDidStart: true,
               jobName: data.TranslatedText
             }

             return cb(null, resp);
           }
         });
     };

     /**
      * Gets status of text translation job
      * @param {JSON} event_info - information about the translation job
      * @param {getStatus~callback} cb - The callback that handles the response.
      */

      translate.prototype.getStatus = function(event_info, cb) {
        console.log('Getting translation job status');

        let _getStatus = (resolve) => {
          let params = {
            TranscriptionJobName: event_info.translate.jobName
          };

          let translate = new AWS.Translation();

          translate.getTranscriptionJob(params, function(err, data) {
            if (err) {
              return Promise.reject(err);
            }
            else {
              // 07.02.2018 - Prevents infinite loop when translate job doesn't start
              // Assigns translation job status to variable to simplify function return statement.
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
       * Gets results of text translation job
       * @param {JSON} event_info - information about the translation job
       * @param {getResults~callback} cb - The callback that handles the response.
       */

      translate.prototype.getResults = function(event_info, cb) {
        console.log('Getting results of translation job');

        let _getResults = (resolve) => {
          let params = {
            TranscriptionJobName: event_info.translate.jobName
          };

          let translate = new AWS.Translate();
          translate.getTranscriptionJob(params, function(err, data) {
              if (err) {
                return Promise.reject(err);
              }
              else {
                if (data.TranscriptionJob.TranscriptionJobStatus == 'FAILED' && event_info.file_type == 'mp4') {
                    let mp4_failed_transcript = {
                      jobName: event_info.translate.jobName,
                      results: {
                        transcripts: [{
                          transcript: ['Translation Failed: ', data.TranscriptionJob.FailureReason].join(' ')
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

       translate.prototype.pause = function(duration) {
         return new Promise(res =>
           setTimeout(res, duration));
       }

       translate.prototype.retry = function(retries, fn, delay = 0) {
         let promise = new Promise(res => fn(res));

         return promise.catch((e) => {
           console.log(`translate.${fn.name} caught error ${e.message}, retry in ${delay}s (${retries} retries left)...`);

           if (retries > 0) {
             return this.pause(delay).then(() =>
               this.retry(retries - 1, fn, delay * 2));
           }

           return Promise.reject(e);
         });
       }
    return translate;

 })();

 module.exports = translate;

