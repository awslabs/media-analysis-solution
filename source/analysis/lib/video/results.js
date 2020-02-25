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
 * Collects and stores video analysis results from
 * Amazon Rekognition.
 *
 * @class results
 */

 let results = (function() {

   /**
    * @class results
    * @constructor
    */
    let results = function() {};

    /**
     * Gets video analysis results from Amazon Rekognition
     * @param {JSON} video_info - information about the analyzed video
     * @param {getResults~callback} cb - The callback that handles the response.
     */

     results.prototype.getResults = function(video_info, cb) {
        let result_type = video_info.video.job_tag.split('_').pop();
        let params = {
            JobId: video_info.video.job_id
        };
        let loop_count = 1;

        if (result_type == 'labels'){
            let label_array = [];
            if (video_info.hasOwnProperty('results')) {
                label_array = video_info.results.labels.labels;
                loop_count = video_info.results.labels.loop_count;
                params = {
                    JobId: video_info.video.job_id,
                    NextToken: video_info.results.labels.next_token
                };
            }
            getLabels(params, video_info.owner_id, video_info.object_id, loop_count, label_array, function(err, data) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    return cb(null, data);
                }
            });
        }
        else if (result_type == 'celebs'){
            let celeb_array = [];
            if (video_info.hasOwnProperty('results')) {
                celeb_array = video_info.results.celebs.celebs;
                loop_count = video_info.results.celebs.loop_count;
                params = {
                    JobId: video_info.video.job_id,
                    NextToken: video_info.results.celebs.next_token
                };
            }
            getCelebs(params, video_info.owner_id, video_info.object_id, loop_count, celeb_array, function(err, data) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    return cb(null, data);
                }
            });
        }
        else if (result_type == 'faces'){
            let face_array = [];
            if (video_info.hasOwnProperty('results')) {
                face_array = video_info.results.faces.faces;
                loop_count = video_info.results.faces.loop_count;
                params = {
                    JobId: video_info.video.job_id,
                    NextToken: video_info.results.faces.next_token
                };
            }
            getFaces(params, video_info.owner_id, video_info.object_id, loop_count, face_array, function(err, data) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    return cb(null, data);
                }
            });
        }
        else if (result_type == 'persons'){
            if (video_info.hasOwnProperty('results')) {
                loop_count = video_info.results.persons.loop_count;
                params = {
                    JobId: video_info.video.job_id,
                    NextToken: video_info.results.persons.next_token
                };
            }
            getPersons(params, video_info.owner_id, video_info.object_id, loop_count, function(err, data) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    return cb(null, data);
                }
            });
        }
        else if (result_type == 'facesearch'){
            let face_match_array = [];
            if (video_info.hasOwnProperty('results')) {
                face_match_array = video_info.results.face_matches.face_matches;
                loop_count = video_info.results.face_matches.loop_count;
                params = {
                    JobId: video_info.video.job_id,
                    NextToken: video_info.results.face_matches.next_token
                };
            }
            getFaceSearch(params, video_info.owner_id, video_info.object_id, loop_count, face_match_array, function(err, data) {
                if (err) {
                    return cb(err, null);
                }
                else {
                    return cb(null, data);
                }
            });
        }

     };

     /**
      * Gets results from Amazon Rekognition label detection
      * @param {JSON} params - information needed to retrieve results
      * @param {string} owner_id - cognitoIdentityId of the media file owner
      * @param {string} object_id - UUID of the media file
      * @param {int} loop_count - retrieval count
      * @param {array} labels - label metadata extracted
      * @param {getLabels~callback} cb - The callback that handles the response.
      */
     let getLabels = function(params, owner_id, object_id, loop_count, labels, cb) {
        let rekognition = new AWS.Rekognition();
        rekognition.getLabelDetection(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                let label_array = labels;
                for (var l in data.Labels){
                    if (data.Labels[l].Label.Confidence >= confidence_score) {
                        if (label_array.includes(data.Labels[l].Label.Name.toLowerCase()) == false){
                            label_array.push(data.Labels[l].Label.Name.toLowerCase());
                        }
                    }
                }

                let label_key = ['private',owner_id,'media',object_id,'results','labels.json'].join('/');

                if (loop_count != 1) {
                    let filename = ['labels',loop_count,'.json'].join('');
                    label_key = ['private',owner_id,'media',object_id,'results',filename].join('/');
                }

                let s3_params = {
                    Bucket: s3Bucket,
                    Key: label_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(error, result) {
                    if (error){
                      return cb(error, null);
                    }
                    else {
                      let label_response;
                      if (data.hasOwnProperty('NextToken')) {
                          label_response = {'duration': data.VideoMetadata.DurationMillis, 'labels': label_array, 'status': 'IN PROGRESS', 'loop_count':loop_count += 1, 'next_token':data.NextToken};
                      }
                      else {
                          label_response = {'duration': data.VideoMetadata.DurationMillis, 'labels': label_array.splice(0,500), 'status': 'COMPLETE', 'key': ['private',owner_id,'media',object_id,'results','labels.json'].join('/')};
                      }
                      console.log(label_response);
                      return cb(null,label_response);
                    }
                });
            }
        });
     };

     /**
      * Gets results from Amazon Rekognition celebrity detection
      * @param {JSON} params - information needed to retrieve results
      * @param {string} owner_id - cognitoIdentityId of the media file owner
      * @param {string} object_id - UUID of the media file
      * @param {int} loop_count - retrieval count
      * @param {array} celebs - celeb metadata extracted
      * @param {getCelebs~callback} cb - The callback that handles the response.
      */
     let getCelebs = function(params, owner_id, object_id, loop_count, celebs, cb) {
        let rekognition = new AWS.Rekognition();
        rekognition.getCelebrityRecognition(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                let celeb_array = celebs;
                  for (var c in data.Celebrities){
                      if (data.Celebrities[c].Celebrity.Confidence >= confidence_score) {
                          if (celeb_array.includes(data.Celebrities[c].Celebrity.Name.toLowerCase()) == false){
                              celeb_array.push(data.Celebrities[c].Celebrity.Name.toLowerCase());
                          }
                      }
                }

                let celeb_key = ['private',owner_id,'media',object_id,'results','celebs.json'].join('/');

                if (loop_count != 1) {
                    let filename = ['celebs',loop_count,'.json'].join('');
                    celeb_key = ['private',owner_id,'media',object_id,'results',filename].join('/');
                }

                let s3_params = {
                    Bucket: s3Bucket,
                    Key: celeb_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(error, result) {
                    if (error){
                      return cb(error, null);
                    }
                    else {
                      let celeb_response;
                      if (data.hasOwnProperty('NextToken')) {
                          celeb_response = {'duration': data.VideoMetadata.DurationMillis, 'celebs': celeb_array, 'status': 'IN PROGRESS', 'loop_count':loop_count += 1, 'next_token':data.NextToken};
                      }
                      else {
                          celeb_response = {'duration': data.VideoMetadata.DurationMillis, 'key': ['private',owner_id,'media',object_id,'results','celebs.json'].join('/'), 'celebs': celeb_array, 'status': 'COMPLETE'};
                      }
                      console.log(celeb_response);
                      return cb(null,celeb_response);
                    }
                });
            }
        });
     };

     /**
      * Gets results from Amazon Rekognition face detection
      * @param {JSON} params - information needed to retrieve results
      * @param {string} owner_id - cognitoIdentityId of the media file owner
      * @param {string} object_id - UUID of the media file
      * @param {int} loop_count - retrieval count
      * @param {array} faces - face metadata extracted
      * @param {getFaces~callback} cb - The callback that handles the response.
      */
     let getFaces = function(params, owner_id, object_id, loop_count, faces, cb) {
        let rekognition = new AWS.Rekognition();
        rekognition.getFaceDetection(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                let metadata = data.Faces;
                let face_array = faces;
                if (metadata.length != 0) {
                    for (var f in metadata){
                        if (metadata[f].Face.Smile.Confidence >= confidence_score && metadata[f].Face.Smile.Value == true){
                            if (face_array.includes('smile') == false){
                                face_array.push('smile');
                            }
                        }
                        if (metadata[f].Face.Eyeglasses.Confidence >= confidence_score && metadata[f].Face.Eyeglasses.Value == true){
                            if (face_array.includes('eyeglasses') == false){
                                face_array.push('eyeglasses');
                            }
                        }
                        if (metadata[f].Face.Sunglasses.Confidence >= confidence_score && metadata[f].Face.Sunglasses.Value == true){
                            if (face_array.includes('sunglasses') == false){
                                face_array.push('sunglasses');
                            }
                        }
                        if (metadata[f].Face.Gender.Confidence >= confidence_score){
                            if (face_array.includes(metadata[f].Face.Gender.Value.toLowerCase()) == false){
                                face_array.push(metadata[f].Face.Gender.Value.toLowerCase());
                            }
                        }
                        if (metadata[f].Face.Beard.Confidence >= confidence_score && metadata[f].Face.Beard.Value == true){
                            if (face_array.includes('beard') == false){
                                face_array.push('beard');
                            }
                        }
                        if (metadata[f].Face.Mustache.Confidence >= confidence_score && metadata[f].Face.Mustache.Value == true){
                            if (face_array.includes('mustache') == false){
                                face_array.push('mustache');
                            }
                        }
                        if (metadata[f].Face.EyesOpen.Confidence >= confidence_score && metadata[f].Face.EyesOpen.Value == true){
                            if (face_array.includes('eyes open') == false){
                                face_array.push('eyes open');
                            }
                        }
                        if (metadata[f].Face.MouthOpen.Confidence >= confidence_score && metadata[f].Face.MouthOpen.Value == true){
                            if (face_array.includes('mouth open') == false){
                                face_array.push('mouth open');
                            }
                        }
                        for (var e in metadata[f].Face.Emotions) {
                            if (metadata[f].Face.Emotions[e].Confidence >= confidence_score) {
                                if (face_array.includes(metadata[f].Face.Emotions[e].Type.toLowerCase()) == false) {
                                    face_array.push(metadata[f].Face.Emotions[e].Type.toLowerCase());
                                }
                            }
                        }
                    }
                }

                console.log('metadata extracted, putting to s3');

                let face_key = ['private',owner_id,'media',object_id,'results','faces.json'].join('/');

                if (loop_count != 1) {
                    let filename = ['faces',loop_count,'.json'].join('');
                    face_key = ['private',owner_id,'media',object_id,'results',filename].join('/');
                }
                let s3_params = {
                    Bucket: s3Bucket,
                    Key: face_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(error, result) {
                    if (error){
                      return cb(error, null);
                    }
                    else {
                      console.log('successfully put to s3');
                      let face_response;
                      if (data.hasOwnProperty('NextToken')) {
                          face_response = {'duration': data.VideoMetadata.DurationMillis, 'faces': face_array, 'status': 'IN PROGRESS', 'loop_count':loop_count += 1, 'next_token':data.NextToken};
                      }
                      else {
                          face_response = {'duration': data.VideoMetadata.DurationMillis, 'key': ['private',owner_id,'media',object_id,'results','faces.json'].join('/'), 'faces': face_array, 'faces_detected': (metadata != 0), 'status': 'COMPLETE'};
                      }
                      console.log(face_response);
                      return cb(null,face_response);
                    }
                });
            }
        });
    };

     /**
      * Gets results from Amazon Rekognition 
      * @param {JSON} params - information needed to retrieve results
      * @param {string} owner_id - cognitoIdentityId of the media file owner
      * @param {string} object_id - UUID of the media file
      * @param {int} loop_count - retrieval count
      * @param {getPersons~callback} cb - The callback that handles the response.
      */
     let getPersons = function(params, owner_id, object_id, loop_count, cb) {
        let rekognition = new AWS.Rekognition();
        rekognition.getPersonTracking(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                let persons_key = ['private',owner_id,'media',object_id,'results','persons.json'].join('/');
                if (loop_count != 1) {
                    let filename = ['persons',loop_count,'.json'].join('');
                    persons_key = ['private',owner_id,'media',object_id,'results',filename].join('/');
                }
                let s3_params = {
                    Bucket: s3Bucket,
                    Key: persons_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(error, result) {
                    if (error){
                      return cb(error, null);
                    }
                    else {
                      let persons_response;
                      if (data.hasOwnProperty('NextToken')) {
                          persons_response = {'duration': data.VideoMetadata.DurationMillis, 'status': 'IN PROGRESS', 'loop_count':loop_count += 1, 'next_token':data.NextToken};
                      }
                      else {
                          persons_response = {'duration': data.VideoMetadata.DurationMillis, 'key': ['private',owner_id,'media',object_id,'results','persons.json'].join('/'), 'status': 'COMPLETE'};
                      }
                      console.log(persons_response);
                      return cb(null,persons_response);
                    }
                });
            }
        });
     };

     /**
      * Gets results from Amazon Rekognition celebrity detection
      * @param {JSON} params - information needed to retrieve results
      * @param {string} owner_id - cognitoIdentityId of the media file owner
      * @param {string} object_id - UUID of the media file
      * @param {int} loop_count - retrieval count
      * @param {array} face_matches - face match metadata extracted
      * @param {getCelebs~callback} cb - The callback that handles the response.
      */
     let getFaceSearch = function(params, owner_id, object_id, loop_count, face_matches, cb) {
        let rekognition = new AWS.Rekognition();
        rekognition.getFaceSearch(params, function(err, data) {
            if (err) {
                return cb(err, null);
            }
            else {
                let face_match_array = face_matches;

                if (data.Persons.length != 0) {
                    for (var i in data.Persons){
                        if ('FaceMatches' in data.Persons[i]) {
                            for (var f in data.Persons[i].FaceMatches) {
                                if (data.Persons[i].FaceMatches[f].Similarity >= confidence_score) {
                                    if (face_match_array.includes(data.Persons[i].FaceMatches[f].Face.ExternalImageId) == false){
                                        face_match_array.push(data.Persons[i].FaceMatches[f].Face.ExternalImageId);
                                    }
                                }
                            }
                        }
                    }
                }

                let face_match_key = ['private',owner_id,'media',object_id,'results','face_matches.json'].join('/');

                if (loop_count != 1) {
                    let filename = ['face_matches',loop_count,'.json'].join('');
                    face_match_key = ['private',owner_id,'media',object_id,'results',filename].join('/');
                }

                let s3_params = {
                    Bucket: s3Bucket,
                    Key: face_match_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(error, result) {
                    if (error){
                      return cb(error, null);
                    }
                    else {
                      let face_match_response;
                      if (data.hasOwnProperty('NextToken')) {
                          face_match_response = {'duration': data.VideoMetadata.DurationMillis, 'face_matches': face_match_array, 'status': 'IN PROGRESS', 'loop_count':loop_count += 1, 'next_token':data.NextToken};
                      }
                      else {
                          face_match_response = {'duration': data.VideoMetadata.DurationMillis, 'key': ['private',owner_id,'media',object_id,'results','face_matches.json'].join('/'), 'face_matches': face_match_array, 'status': 'COMPLETE'};
                      }
                      console.log(face_match_response);
                      return cb(null,face_match_response);
                    }
                });
            }
        });
     };

    return results;

 })();

 module.exports = results;
