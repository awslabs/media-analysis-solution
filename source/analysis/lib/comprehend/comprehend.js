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
let upload = require('./../upload');
let creds = new AWS.EnvironmentCredentials('AWS');

const s3Bucket = process.env.S3_BUCKET;
const confidence_score = parseInt(process.env.CONFIDENCE_SCORE);

/**
 * Performs operations for natural language processing using
 * Amazon Comprehend.
 *
 * @class comprehend
 */

 let comprehend = (function() {

   /**
    * @class comprehend
    * @constructor
    */
    let comprehend = function() {};

    /**
     * Detects entities in a transcript
     * @param {JSON} transcript_info - information about the transcript
     * @param {getEntities~callback} cb - The callback that handles the response.
     */

     comprehend.prototype.getEntities = function(transcript_info, cb) {
        let transcript_params = {
            Bucket: s3Bucket,
            Key: transcript_info.results.transcript.key
        }
        let language_code = ((transcript_info.ai_options || {}).language_code || 'en').slice(0, 2);
        getTranscript(transcript_params, function(err, data) {
            if (err) {
              return cb(err,null);
            }
            else {
              let transcript_list = [];
              let transcript = '';

              if (JSON.parse(data.Body.toString('utf-8')).status == 'MP4 FAILED') {
                 transcript = '';
              }
              else {
                 transcript = JSON.parse(data.Body.toString('utf-8')).results.transcripts[0].transcript;
              }
              transcript_list.push(transcript);

              if (transcript == '') {
                  console.log('No words transcribed');

                  let no_entities = {
                    'ResultList': [{
                      'Index': 0,
                      'Entities': []
                    }],
                    'ErrorList': []
                  };

                  let entity_key = ['private',transcript_info.owner_id,'media',transcript_info.object_id,'results','entities.json'].join('/');

                  let s3_params = {
                      Bucket: s3Bucket,
                      Key: entity_key,
                      Body: JSON.stringify(no_entities),
                      ContentType: 'application/json'
                  }
                  upload.respond(s3_params, function(err, data) {
                      if (err){
                        return cb(err, null);
                      }
                      else {
                        let no_transcript_response = {'key': entity_key, 'entities': [], 'status': 'COMPLETE'};
                        return cb(null,no_transcript_response);
                      }
                  });
              }
              else {
                  prepareTranscript(transcript_list, function(err, resp) {
                    if (err) {
                      return cb(err, null);
                    }
                    else {
                      detectEntities(resp, [], [], 0, function(err, data) {
                          if (err) {
                            cb(err, null);
                          }
                          else {
                            let entities = {};
                            let entity_array = [];
                            for (var e in data.ResultList[0].Entities){
                                if (((data.ResultList[0].Entities[e].Score)*100) >= confidence_score) {
                                    if (data.ResultList[0].Entities[e].Text in entities) {
                                        entities[data.ResultList[0].Entities[e].Text] += 1;
                                    }
                                    else {
                                        entities[data.ResultList[0].Entities[e].Text] = 1;
                                    }
                                }
                            }

                            let sorted_entities = Object.keys(entities).map(function(key) {
                                return [key, entities[key]];
                            });

                            sorted_entities.sort(function(first, second) {
                                return second[1] - first[1];
                            });

                            for (var s in sorted_entities){
                                entity_array.push(sorted_entities[s][0].toLowerCase());
                            }


                            let entity_key = ['private',transcript_info.owner_id,'media',transcript_info.object_id,'results','entities.json'].join('/');

                            let s3_params = {
                                Bucket: s3Bucket,
                                Key: entity_key,
                                Body: JSON.stringify(data),
                                ContentType: 'application/json'
                            };

                            upload.respond(s3_params, function(err, data) {
                                if (err){
                                  return cb(err, null);
                                }
                                else {
                                  let entity_response = {'key': entity_key, 'entities': entity_array.splice(0,250), 'status': 'COMPLETE'};
                                  return cb(null,entity_response);
                                }
                            });
                          }
                      }, language_code);
                    }
                  });
              }
            }
        });
     };

     /**
      * Detects phrases in a transcript
      * @param {JSON} transcript_info - information about the transcript
      * @param {getPhrases~callback} cb - The callback that handles the response.
      */

      comprehend.prototype.getPhrases = function(transcript_info, cb) {
         let transcript_params = {
             Bucket: s3Bucket,
             Key: transcript_info.results.transcript.key
         }
         let language_code = ((transcript_info.ai_options || {}).language_code || 'en').slice(0, 2);
         getTranscript(transcript_params, function(err, data) {
             if (err) {
               return cb(err,null);
             }
             else {
               let transcript_list = [];
               let transcript = '';

               if (JSON.parse(data.Body.toString('utf-8')).status == 'MP4 FAILED') {
                  transcript = '';
               }
               else {
                  transcript = JSON.parse(data.Body.toString('utf-8')).results.transcripts[0].transcript;
               }
               transcript_list.push(transcript);

               if (transcript == '') {
                   console.log('No words transcribed');

                   let no_phrases = {
                      'ResultList': [{
                        'Index': 0,
                        'KeyPhrases': []
                      }],
                      'ErrorList': []
                    };

                    let phrase_key = ['private',transcript_info.owner_id,'media',transcript_info.object_id,'results','phrases.json'].join('/');

                   let s3_params = {
                       Bucket: s3Bucket,
                       Key: phrase_key,
                       Body: JSON.stringify(no_phrases),
                       ContentType: 'application/json'
                   }
                   upload.respond(s3_params, function(err, data) {
                       if (err){
                         return cb(err, null);
                       }
                       else {
                         let no_transcript_response = {'key': phrase_key, 'phrases': [], 'status': 'COMPLETE'};
                         return cb(null,no_transcript_response);
                       }
                   });
               }
               else {
                   prepareTranscript(transcript_list, function(err, resp) {
                     if (err) {
                       return cb(err, null);
                     }
                     else {
                       detectPhrases(resp, [], [], 0, function(err, data) {
                           if (err) {
                             cb(err, null);
                           }
                           else {
                             let phrases = {};
                             let phrase_array = [];

                             for (var p in data.ResultList[0].KeyPhrases){
                                 if (((data.ResultList[0].KeyPhrases[p].Score)*100) >= confidence_score) {
                                     if (data.ResultList[0].KeyPhrases[p].Text in phrases) {
                                         phrases[data.ResultList[0].KeyPhrases[p].Text] += 1;
                                     }
                                     else {
                                         phrases[data.ResultList[0].KeyPhrases[p].Text] = 1;
                                     }
                                 }
                             }

                             let sorted_phrases = Object.keys(phrases).map(function(key) {
                                 return [key, phrases[key]];
                             });

                             sorted_phrases.sort(function(first, second) {
                                 return second[1] - first[1];
                             });

                             for (var s in sorted_phrases){
                                 phrase_array.push(sorted_phrases[s][0].toLowerCase());
                             }

                             let phrase_key = ['private',transcript_info.owner_id,'media',transcript_info.object_id,'results','phrases.json'].join('/');

                             let s3_params = {
                                 Bucket: s3Bucket,
                                 Key: phrase_key,
                                 Body: JSON.stringify(data),
                                 ContentType: 'application/json'
                             };

                             upload.respond(s3_params, function(err, data) {
                                 if (err){
                                   return cb(err, null);
                                 }
                                 else {
                                   let phrase_response = {'key': phrase_key, 'phrases': phrase_array.splice(0,250), 'status': 'COMPLETE'};
                                   return cb(null,phrase_response);
                                 }
                             });
                           }
                       }, language_code);
                     }
                   });
               }
             }
         });
      };

     /**
      * Detects key entities from transcript
      * @param {array} transcripts - text to be processed by Amazon Comprehend
      * @param {array} metadata - key entities detected by Amazon Comprehend
      * @param {array} errors - errors encountered by Amazon Comprehend
      * @param {int} i - counter variable for properly batching the transcripts
      * @param {detectEntities~callback} cb - The callback that handles the response.
      */

     let detectEntities = function(transcripts, metadata, errors, i, cb, language_code = 'en'){
       console.log('executing entity detection');
       if (i < transcripts.length) {
           let params = {
               LanguageCode: language_code,
               TextList: transcripts.splice(i, i+25)
           };
           let comprehend = new AWS.Comprehend();
           comprehend.batchDetectEntities(params, function(err, data) {
               if (err) {
                 return cb(err, null);
               }
               else {
                   errors.push.apply(errors,data.ErrorList);
                   for (var r in data.ResultList) {
                       metadata.push.apply(metadata,data.ResultList[r].Entities);
                   }
                   i += 25;
                   detectEntities(transcripts,metadata,errors,i,cb,language_code);
               }
           });
        }
        else {
            let entities_detected = {};
            entities_detected.ResultList = [{Index: 0, Entities: metadata}];
            entities_detected.ErrorList = errors;
            return cb(null,entities_detected);
        }
    };

    /**
     * Detects key phrases from transcript
     * @param {array} transcripts - text to be processed by Amazon Comprehend
     * @param {array} metadata - key phrases detected by Amazon Comprehend
     * @param {array} errors - errors encountered by Amazon Comprehend
     * @param {int} i - counter variable for properly batching the transcripts
     * @param {detectPhrases~callback} cb - The callback that handles the response.
     */

    let detectPhrases = function(transcripts, metadata, errors, i, cb, language_code = 'en'){
      console.log('executing phrase detection');
      if (i < transcripts.length) {
          let params = {
              LanguageCode: language_code,
              TextList: transcripts.splice(i, i+25)
          };
          let comprehend = new AWS.Comprehend();
          comprehend.batchDetectKeyPhrases(params, function(err, data) {
              if (err) {
                return cb(err, null);
              }
              else {
                  errors.push.apply(errors,data.ErrorList);
                  for (var r in data.ResultList) {
                      metadata.push.apply(metadata,data.ResultList[r].KeyPhrases);
                  }
                  i += 25;
                  detectPhrases(transcripts,metadata,errors,i,cb, language_code);
              }
          });
       }
       else {
           let phrases_detected = {};
           phrases_detected.ResultList = [{Index: 0, KeyPhrases: metadata}];
           phrases_detected.ErrorList = errors;
           return cb(null,phrases_detected);
       }
   };

     /**
      * Gets transcript from S3
      * @param {JSON} params - location of the transcript
      * @param {getTranscript~callback} cb - The callback that handles the response.
      */

     let getTranscript = function(params, cb){
        let s3 = new AWS.S3();
        s3.getObject(params, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err,null);
            }
            else {
              return cb(null,data);
            }
        });
     };

     /**
      * Breaks the transcript into manageable pieces for Amazon Comprehend
      * @param {array} transcripts - text to be processed by Amazon Comprehend
      * @param {prepareTranscript~callback} cb - The callback that handles the response.
      */

     let prepareTranscript = function(transcripts, cb){
          let new_transcripts = [];
          let too_big = function(element) {
              return Buffer.byteLength(element) > 5000;
          };
          if (transcripts.some(too_big)) {
              for (var t in transcripts) {
                  let temp = transcripts[t].split(' ');
                  let wordcount = temp.length;
                  let n = wordcount/2;
                  let i = 0;
                  while (i < wordcount) {
                      new_transcripts.push(temp.slice(i,i+n).join(' '));
                      i += n;
                  }
              }
              prepareTranscript(new_transcripts,cb);
          }
          else {
              return cb(null,transcripts);
          }
     };

    return comprehend;

 })();

 module.exports = comprehend;
