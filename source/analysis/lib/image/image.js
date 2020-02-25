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
 * Performs operations for image recognition actions using
 * Amazon Rekognition.
 *
 * @class image
 */

 let image = (function() {

   /**
    * @class image
    * @constructor
    */
    let image = function() {};

    /**
     * Recognizes labels in an image
     * @param {JSON} image_info - information about the image to be processed
     * @param {getLabels~callback} cb - The callback that handles the response.
     */

     image.prototype.getLabels = function(image_info, cb){
        console.log('Executing image label detection');

        let rek_params = {
             Image: {
                 S3Object: {
                   Bucket: s3Bucket,
                   Name: image_info.key
                 }
             }
         };

         let rekognition = new AWS.Rekognition();
         rekognition.detectLabels(rek_params, function(err, data) {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            else {
                /**
                * Build label metadata array
                */
                let labels = [];
                for (var l in data.Labels) {
                   if (data.Labels[l].Confidence >= confidence_score) {
                       labels.push(data.Labels[l].Name.toLowerCase());
                   }
                }

                let label_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','labels.json'].join('/');

                let s3_params = {
                    Bucket: s3Bucket,
                    Key: label_key,
                    Body: JSON.stringify(data),
                    ContentType: 'application/json'
                };

                upload.respond(s3_params, function(err, response) {
                    if (err){
                      console.log(err);
                      return cb(err, null);
                    }
                    else {
                        console.log(response);
                        let label_response = {'key': label_key, 'labels': labels, 'status': 'COMPLETE'};
                        return cb(null,label_response);
                    }
                });
            }
         });
     };

     /**
      * Recognizes celebrities in an image
      * @param {JSON} image_info - information about the image to be processed
      * @param {getCelebs~callback} cb - The callback that handles the response.
      */

      image.prototype.getCelebs = function(image_info, cb){
         console.log('Executing image celebrity detection');

         let rek_params = {
              Image: {
                  S3Object: {
                    Bucket: s3Bucket,
                    Name: image_info.key
                  }
              }
          };

          let rekognition = new AWS.Rekognition();
          rekognition.recognizeCelebrities(rek_params, function(err, data) {
             if (err) {
                 console.log(err);
                 return cb(err, null);
             }
             else {
                 /**
                 * Build celeb metadata array
                 */
                 let celebs = [];
                 for (var c in data.CelebrityFaces) {
                    if (data.CelebrityFaces[c].MatchConfidence >= confidence_score) {
                        celebs.push(data.CelebrityFaces[c].Name.toLowerCase());
                    }
                 }

                 let celeb_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','celebs.json'].join('/');

                 let s3_params = {
                     Bucket: s3Bucket,
                     Key: celeb_key,
                     Body: JSON.stringify(data),
                     ContentType: 'application/json'
                 };

                 upload.respond(s3_params, function(err, response) {
                     if (err){
                       console.log(err);
                       return cb(err, null);
                     }
                     else {
                         console.log(response);
                         let celeb_response = {'key': celeb_key, 'celebs': celebs, 'status': 'COMPLETE'};
                         return cb(null,celeb_response);
                     }
                 });
             }
          });
      };

      /**
       * Recognizes faces in an image
       * @param {JSON} image_info - information about the image to be processed
       * @param {getFaces~callback} cb - The callback that handles the response.
       */

       image.prototype.getFaces = function(image_info, cb){
          console.log('Executing image face detection');

          let rek_params = {
               Image: {
                   S3Object: {
                     Bucket: s3Bucket,
                     Name: image_info.key
                   }
               },
               Attributes: ['ALL']
           };

           let rekognition = new AWS.Rekognition();
           rekognition.detectFaces(rek_params, function(err, data) {
              if (err) {
                  console.log(err);
                  return cb(err, null);
              }
              else {
                  /**
                  * Build face metadata array
                  */
                  let faces = [];

                  if (data.FaceDetails.length != 0) {
                      for (var i in data.FaceDetails) {
                          if (data.FaceDetails[i].Smile.Confidence >= confidence_score && data.FaceDetails[i].Smile.Value == true) {
                              if (faces.includes('smile') == false){
                                  faces.push('smile');
                              }
                          }
                          if (data.FaceDetails[i].Eyeglasses.Confidence >= confidence_score && data.FaceDetails[i].Eyeglasses.Value == true) {
                              if (faces.includes('eyeglasses') == false){
                                  faces.push('eyeglasses');
                              }
                          }
                          if (data.FaceDetails[i].Sunglasses.Confidence >= confidence_score && data.FaceDetails[i].Sunglasses.Value == true) {
                              if (faces.includes('sunglasses') == false){
                                  faces.push('sunglasses');
                              }
                          }
                          if (data.FaceDetails[i].Gender.Confidence >= confidence_score) {
                              if (faces.includes(data.FaceDetails[i].Gender.Value.toLowerCase()) == false){
                                  faces.push(data.FaceDetails[i].Gender.Value.toLowerCase());
                              }
                          }
                          if (data.FaceDetails[i].Beard.Confidence >= confidence_score && data.FaceDetails[i].Beard.Value == true) {
                              if (faces.includes('beard') == false){
                                  faces.push('beard');
                              }
                          }
                          if (data.FaceDetails[i].Mustache.Confidence >= confidence_score && data.FaceDetails[i].Mustache.Value == true) {
                              if (faces.includes('mustache') == false){
                                  faces.push('mustache');
                              }
                          }
                          if (data.FaceDetails[i].EyesOpen.Confidence >= confidence_score && data.FaceDetails[i].EyesOpen.Value == true) {
                              if (faces.includes('eyes open') == false){
                                  faces.push('eyes open');
                              }
                          }
                          if (data.FaceDetails[i].MouthOpen.Confidence >= confidence_score && data.FaceDetails[i].MouthOpen.Value == true) {
                              if (faces.includes('mouth open') == false){
                                  faces.push('mouth open');
                              }
                          }
                          for (var e in data.FaceDetails[i].Emotions) {
                              //console.log(data.FaceDetails[i].Emotions[e]);
                              if (data.FaceDetails[i].Emotions[e].Confidence >= confidence_score) {
                                  if (faces.includes(data.FaceDetails[i].Emotions[e].Type.toLowerCase()) == false){
                                      faces.push(data.FaceDetails[i].Emotions[e].Type.toLowerCase());
                                  }
                              }
                          }
                      }
                  }

                  let face_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','faces.json'].join('/');

                  let s3_params = {
                      Bucket: s3Bucket,
                      Key: face_key,
                      Body: JSON.stringify(data),
                      ContentType: 'application/json'
                  };

                  upload.respond(s3_params, function(err, response) {
                      if (err){
                        console.log(err);
                        return cb(err, null);
                      }
                      else {
                          console.log(response);
                          let face_response = {'key': face_key, 'faces': faces, 'faces_detected': (data.FaceDetails.length != 0), 'status': 'COMPLETE'};
                          return cb(null,face_response);
                      }
                  });
              }
           });
       };

       /**
        * Matches faces in an image with known faces in a Rekognition collection
        * @param {JSON} image_info - information about the image to be analyzed
        * @param {getFaceMatches~callback} cb - The callback that handles the response.
        */

        image.prototype.getFaceMatches = function(image_info, cb){
           console.log('Executing image face matching');

           if (image_info.results.faces.faces_detected) {
               let rek_params = {
                    CollectionId: image_info.owner_id.replace(':','-'),
                    Image: {
                        S3Object: {
                          Bucket: s3Bucket,
                          Name: image_info.key
                        }
                    }
                };

                let rekognition = new AWS.Rekognition();
                rekognition.searchFacesByImage(rek_params, function(err, data) {
                   if (err) {
                       console.log(err);
                       if (err.code == 'ResourceNotFoundException') {
                          console.log('Please upload a face image to create a collection');

                          let face_match_body = {
                            FaceMatches: []
                          };

                          let face_match_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','face_matches.json'].join('/');

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
                                  let no_collection_response = {'key': face_match_key, 'face_matches': [], 'status': 'COMPLETE'};
                                  return cb(null,no_collection_response);
                              }
                          });
                       }
                       else{
                          return cb(err, null);
                       }
                   }
                   else {
                      let matches = [];
                      if ('FaceMatches' in data) {
                          for (var m in data.FaceMatches) {
                              if (data.FaceMatches[m].Similarity >= confidence_score) {
                                  matches.push(data.FaceMatches[m].Face.ExternalImageId.toLowerCase());
                              }
                          }
                      }

                       let face_match_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','face_matches.json'].join('/');

                       let s3_params = {
                           Bucket: s3Bucket,
                           Key: face_match_key,
                           Body: JSON.stringify(data),
                           ContentType: 'application/json'
                       };

                       upload.respond(s3_params, function(err, response) {
                           if (err){
                               console.log(err);
                               return cb(err, null);
                           }
                           else {
                               console.log(response);
                               let face_match_response = {'key': face_match_key, 'face_matches': matches, 'status': 'COMPLETE'};
                               return cb(null,face_match_response);
                           }
                       });
                   }
                });
           }
           else {
              console.log('No faces detected. Skipping search for matching faces.')
              let face_match_body = {
                FaceMatches: []
              };

              let face_match_key = ['private',image_info.owner_id,'media',image_info.object_id,'results','face_matches.json'].join('/');

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
                     let face_match_response = {'key': face_match_key, 'face_matches': [], 'status': 'COMPLETE'};
                     return cb(null,face_match_response);
                 }
              });

           }
        };

    return image;

 })();

 module.exports = image;
