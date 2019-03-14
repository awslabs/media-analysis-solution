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

let creds = new AWS.EnvironmentCredentials('AWS');
const s3Bucket = process.env.S3_BUCKET;
const confidence_score = parseInt(process.env.CONFIDENCE_SCORE);

/**
 * Constructs deatiled metadata object
 *
 * @class lookup
 */
let lookup = (function() {

    /**
     * @class lookup
     * @constructor
     */
    let lookup = function() {};

    /**
     * Retrieves detailed information on the requested metadata
     * @param {string} object_id - uuid of the media object
     * @param {string} lookup_type - type of metadata you're retrieving
     * @param {string} owner_id - cognitoIdentityId of the requester
     * @param {int} page_num - result page number requested
     * @param {getDetails~requestCallback} cb - The callback that handles the response.
     */
    lookup.prototype.getDetails = function(object_id, lookup_type, owner_id, page_num, cb) {

      console.log('getting: \'' + lookup_type + '\' for \'' +object_id+ '\'');

      if (lookup_type == 'labels') {

          let filename = 'labels.json';
          if (page_num > 1) {
              filename = ['labels',page_num,'.json'].join('');
          }

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results',filename].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'labels', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building label data output');
                let label_data = JSON.parse(data.Body.toString('utf-8'));
                let Labels = {};
                let labels_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results',filename].join('/')}, 'Labels':[]};

                if (data.Next) {
                    labels_out['Next'] = data.Next;
                }

                if ('VideoMetadata' in label_data) {
                    labels_out['MediaType'] = 'video';
                    for (var l in label_data.Labels) {
                        if (label_data.Labels[l].Label.Confidence >= confidence_score) {
                            if ((label_data.Labels[l].Label.Name.toLowerCase() in Labels) == false) {
                                Labels[label_data.Labels[l].Label.Name.toLowerCase()] = {};
                                Labels[label_data.Labels[l].Label.Name.toLowerCase()]['Name'] = label_data.Labels[l].Label.Name;
                                Labels[label_data.Labels[l].Label.Name.toLowerCase()]['Impressions'] = [{'Timestamp':label_data.Labels[l].Timestamp,'Confidence':label_data.Labels[l].Label.Confidence}];
                            }
                            else {
                                Labels[label_data.Labels[l].Label.Name.toLowerCase()]['Impressions'].push({'Timestamp':label_data.Labels[l].Timestamp,'Confidence':label_data.Labels[l].Label.Confidence});
                            }
                        }
                    }
                }
                else {
                    labels_out['MediaType'] = 'image';
                    for (var l in label_data.Labels) {
                        if (label_data.Labels[l].Confidence >= confidence_score)  {
                            Labels[label_data.Labels[l].Name.toLowerCase()] = {};
                            Labels[label_data.Labels[l].Name.toLowerCase()]['Name'] = label_data.Labels[l].Name;
                            Labels[label_data.Labels[l].Name.toLowerCase()]['Impressions']= [{'Timestamp':null, 'Confidence':label_data.Labels[l].Confidence}];
                        }
                    }
                }
                for (var i in Labels) {
                    labels_out.Labels.push(Labels[i]);
                }
                return cb(null, labels_out);
              }
          });
      }
      else if (lookup_type == 'celebs') {

          let filename = 'celebs.json';
          if (page_num > 1) {
              filename = ['celebs',page_num,'.json'].join('');
          }

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results',filename].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'celebs', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building celeb data output');
                let celeb_data = JSON.parse(data.Body.toString('utf-8'));
                let Celebs = {};
                let celebs_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results',filename].join('/')}, 'Celebs':[]};

                if (data.Next) {
                    celebs_out['Next'] = data.Next;
                }

                if ('VideoMetadata' in celeb_data) {
                    celebs_out['MediaType'] = 'video';

                    for (var c in celeb_data.Celebrities) {
                        if (celeb_data.Celebrities[c].Celebrity.Confidence >= confidence_score) {
                            let bounding_box = celeb_data.Celebrities[c].Celebrity.BoundingBox;
                            if ((celeb_data.Celebrities[c].Celebrity.Id in Celebs) == false) {
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id] = {};
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id]['Name'] = celeb_data.Celebrities[c].Celebrity.Name;
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id]['Id'] = celeb_data.Celebrities[c].Celebrity.Id;
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id]['Urls'] = celeb_data.Celebrities[c].Celebrity.Urls;
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id]['Impressions'] = [{'Timestamp':celeb_data.Celebrities[c].Timestamp,'Confidence':celeb_data.Celebrities[c].Celebrity.Confidence,'BoundingBox':bounding_box}];
                            }
                            else {
                                Celebs[celeb_data.Celebrities[c].Celebrity.Id].Impressions.push({'Timestamp':celeb_data.Celebrities[c].Timestamp,'Confidence':celeb_data.Celebrities[c].Celebrity.Confidence,'BoundingBox':bounding_box});
                            }

                        }
                    }
                }
                else {
                    celebs_out['MediaType'] = 'image';
                    for (var c in celeb_data.CelebrityFaces) {
                        if (celeb_data.CelebrityFaces[c].MatchConfidence >= confidence_score) {
                            Celebs[celeb_data.CelebrityFaces[c].Id] = {};
                            Celebs[celeb_data.CelebrityFaces[c].Id]['Name'] = celeb_data.CelebrityFaces[c].Name;
                            Celebs[celeb_data.CelebrityFaces[c].Id]['Id'] = celeb_data.CelebrityFaces[c].Id;
                            Celebs[celeb_data.CelebrityFaces[c].Id]['Urls'] = celeb_data.CelebrityFaces[c].Urls;
                            Celebs[celeb_data.CelebrityFaces[c].Id]['Impressions'] = [{'Timestamp':null,'Confidence':celeb_data.CelebrityFaces[c].MatchConfidence,'Face':{'BoundingBox': celeb_data.CelebrityFaces[c].Face.BoundingBox}}];
                        }
                    }
                }
                for (var i in Celebs) {
                    celebs_out.Celebs.push(Celebs[i]);
                }
                return cb(null, celebs_out);
              }
          });
      }
      else if (lookup_type == 'faces') {

          let filename = 'faces.json';
          if (page_num > 1) {
              filename = ['faces',page_num,'.json'].join('');
          }

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results',filename].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'faces', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building face data output');
                let face_data = JSON.parse(data.Body.toString('utf-8'));
                let Faces = {};
                let FaceBox = {};
                let faces_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results',filename].join('/')}, 'Attributes':[], 'Faces':[]};

                if (data.Next) {
                    faces_out['Next'] = data.Next;
                }

                if ('VideoMetadata' in face_data) {
                    faces_out['MediaType'] = 'video';
                    let count = 0;
                    for (var f in face_data.Faces) {
                        FaceBox[count] = {'FaceIndex': count, 'Timestamp':face_data.Faces[f].Timestamp, 'BoundingBox':face_data.Faces[f].Face.BoundingBox};

                        if (face_data.Faces[f].Face.Smile.Value == true && face_data.Faces[f].Face.Smile.Confidence >= confidence_score) {
                            if (('smile' in Faces) == false) {
                                Faces['smile'] = {'Name':'Smile', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Smile.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['smile'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Smile.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.Eyeglasses.Value == true && face_data.Faces[f].Face.Eyeglasses.Confidence >= confidence_score) {
                            if (('eyeglasses' in Faces) == false) {
                                Faces['eyeglasses'] = {'Name':'Eyeglasses', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Eyeglasses.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['eyeglasses'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Eyeglasses.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.Sunglasses.Value == true && face_data.Faces[f].Face.Sunglasses.Confidence >= confidence_score) {
                            if (('sunglasses' in Faces) == false) {
                                Faces['sunglasses'] = {'Name':'Sunglasses', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Sunglasses.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['sunglasses'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Sunglasses.Confidence, 'BoundingBox':face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.Gender.Confidence >= confidence_score) {
                            if ((face_data.Faces[f].Face.Gender.Value.toLowerCase() in Faces) == false) {
                                Faces[face_data.Faces[f].Face.Gender.Value.toLowerCase()] = {'Name':face_data.Faces[f].Face.Gender.Value, 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Gender.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces[face_data.Faces[f].Face.Gender.Value.toLowerCase()].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Gender.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.Beard.Value == true && face_data.Faces[f].Face.Beard.Confidence >= confidence_score) {
                            if (('beard' in Faces) == false) {
                                Faces['beard'] = {'Name':'Beard', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Beard.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['beard'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Beard.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.Mustache.Value == true && face_data.Faces[f].Face.Mustache.Confidence >= confidence_score) {
                            if (('mustache' in Faces) == false) {
                                Faces['mustache'] = {'Name':'Mustache', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Mustache.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['mustache'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Mustache.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.EyesOpen.Value == true && face_data.Faces[f].Face.EyesOpen.Confidence >= confidence_score) {
                            if (('eyesopen' in Faces) == false) {
                                Faces['eyesopen'] = {'Name':'EyesOpen', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.EyesOpen.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['eyesopen'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.EyesOpen.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        if (face_data.Faces[f].Face.MouthOpen.Value == true && face_data.Faces[f].Face.MouthOpen.Confidence >= confidence_score) {
                            if (('mouthopen' in Faces) == false) {
                                Faces['mouthopen'] = {'Name':'MouthOpen', 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.MouthOpen.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                            }
                            else {
                                Faces['mouthopen'].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.MouthOpen.Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                            }
                        }
                        for (var e in face_data.Faces[f].Face.Emotions) {
                            if (face_data.Faces[f].Face.Emotions[e].Confidence >= confidence_score) {
                                if ((face_data.Faces[f].Face.Emotions[e].Type.toLowerCase() in Faces) == false) {
                                    Faces[face_data.Faces[f].Face.Emotions[e].Type.toLowerCase()] = {'Name':face_data.Faces[f].Face.Emotions[e].Type, 'Impressions':[{'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Emotions[e].Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox}]};
                                }
                                else {
                                    Faces[face_data.Faces[f].Face.Emotions[e].Type.toLowerCase()].Impressions.push({'Timestamp':face_data.Faces[f].Timestamp, 'Confidence': face_data.Faces[f].Face.Emotions[e].Confidence, 'BoundingBox': face_data.Faces[f].Face.BoundingBox});
                                }
                            }
                        }
                        count += 1;
                    }
                }
                else {
                    faces_out['MediaType'] = 'image';
                    let count = 0;
                    for (var f in face_data.FaceDetails) {
                        FaceBox[count] = {'FaceIndex':count, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}};
                        if (face_data.FaceDetails[f].Smile.Value == true && face_data.FaceDetails[f].Smile.Confidence >= confidence_score) {
                            if (('smile' in Faces) == false) {
                                Faces['smile'] = {'Name':'Smile', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Smile.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                            }
                            else {
                                Faces['smile'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Smile.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                            }
                        }
                        if (face_data.FaceDetails[f].Eyeglasses.Value == true && face_data.FaceDetails[f].Eyeglasses.Confidence >= confidence_score) {
                          if (('eyeglasses' in Faces) == false) {
                              Faces['eyeglasses'] = {'Name':'Eyeglasses', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Eyeglasses.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['eyeglasses'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Eyeglasses.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].Sunglasses.Value == true && face_data.FaceDetails[f].Sunglasses.Confidence >= confidence_score) {
                          if (('sunglasses' in Faces) == false) {
                              Faces['sunglasses'] = {'Name':'Sunglasses', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Sunglasses.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['sunglasses'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Sunglasses.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].Gender.Confidence >= confidence_score) {
                          if ((face_data.FaceDetails[f].Gender.Value.toLowerCase() in Faces) == false){
                              Faces[face_data.FaceDetails[f].Gender.Value.toLowerCase()] = {'Name':face_data.FaceDetails[f].Gender.Value, 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Gender.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces[face_data.FaceDetails[f].Gender.Value.toLowerCase()].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Gender.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].Beard.Value == true && face_data.FaceDetails[f].Beard.Confidence >= confidence_score) {
                          if (('beard' in Faces) == false) {
                              Faces['beard'] = {'Name':'Beard', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Beard.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['beard'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Beard.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].Mustache.Value == true && face_data.FaceDetails[f].Mustache.Confidence >= confidence_score) {
                          if (('mustache' in Faces) == false) {
                              Faces['mustache'] = {'Name':'Mustache', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Mustache.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['mustache'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].Mustache.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].EyesOpen.Value == true && face_data.FaceDetails[f].EyesOpen.Confidence >= confidence_score) {
                          if (('eyesopen' in Faces) == false) {
                              Faces['eyesopen'] = {'Name':'EyesOpen', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].EyesOpen.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['eyesopen'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].EyesOpen.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        if (face_data.FaceDetails[f].MouthOpen.Value == true && face_data.FaceDetails[f].MouthOpen.Confidence >= confidence_score) {
                          if (('mouthopen' in Faces) == false) {
                              Faces['mouthopen'] = {'Name':'MouthOpen', 'Impressions':[{'Timestamp':null, 'Confidence': face_data.FaceDetails[f].MouthOpen.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                          }
                          else {
                              Faces['mouthopen'].Impressions.push({'Timestamp':null, 'Confidence': face_data.FaceDetails[f].MouthOpen.Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                          }
                        }
                        for (var e in face_data.FaceDetails[f].Emotions) {
                            if (face_data.FaceDetails[f].Emotions[e].Confidence >= confidence_score) {
                              if ((face_data.FaceDetails[f].Emotions[e].Type.toLowerCase() in Faces) == false) {
                                  Faces[face_data.FaceDetails[f].Emotions[e].Type.toLowerCase()] = {'Name':face_data.FaceDetails[f].Emotions[e].Type, 'Impressions':[{'Timestamp':null, 'Confidence':face_data.FaceDetails[f].Emotions[e].Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}}]};
                              }
                              else {
                                  Faces[face_data.FaceDetails[f].Emotions[e].Type.toLowerCase()].Impressions.push({'Timestamp':null, 'Confidence':face_data.FaceDetails[f].Emotions[e].Confidence, 'Face':{'BoundingBox':face_data.FaceDetails[f].BoundingBox}});
                              }
                            }
                        }
                        count += 1;
                    }
                }
                for (var i in Faces) {
                    faces_out.Attributes.push(Faces[i]);
                }
                for (var i in FaceBox) {
                    faces_out.Faces.push(FaceBox[i]);
                }
                return cb(null, faces_out);
              }
          });
      }
      else if (lookup_type == 'face_matches') {

          let filename = 'face_matches.json';
          if (page_num > 1) {
              filename = ['face_matches',page_num,'.json'].join('');
          }

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results',filename].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'face_matches', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building face match data output');
                let face_match_data = JSON.parse(data.Body.toString('utf-8'));
                let FaceMatches = {};
                let face_match_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results',filename].join('/')}, 'FaceMatches':[]};

                if (data.Next) {
                    face_match_out['Next'] = data.Next;
                }

                if ('VideoMetadata' in face_match_data) {
                    face_match_out['MediaType'] = 'video';

                    for (var i in face_match_data.Persons) {
                        if ('FaceMatches' in face_match_data.Persons[i]) {
                            let bounding_box = face_match_data.Persons[i].Person.Face.BoundingBox;
                            for (var f in face_match_data.Persons[i].FaceMatches) {
                                if (face_match_data.Persons[i].FaceMatches[f].Similarity >= confidence_score) {
                                    if ((face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId in FaceMatches) == false) {
                                        FaceMatches[face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId] = {};
                                        FaceMatches[face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId]['ExternalImageId'] = face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId;
                                        FaceMatches[face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId]['Impressions'] = [{'Timestamp':face_match_data.Persons[i].Timestamp, 'Confidence':face_match_data.Persons[i].FaceMatches[f].Similarity, 'Face':{'FaceId':face_match_data.Persons[i].FaceMatches[f].Face.FaceId, 'BoundingBox': bounding_box}}];
                                    }
                                    else {
                                        FaceMatches[face_match_data.Persons[i].FaceMatches[f].Face.ExternalImageId].Impressions.push({'Timestamp':face_match_data.Persons[i].Timestamp, 'Confidence':face_match_data.Persons[i].FaceMatches[f].Similarity, 'Face':{'FaceId':face_match_data.Persons[i].FaceMatches[f].Face.FaceId, 'BoundingBox': bounding_box}});
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    face_match_out['MediaType'] = 'image';
                    if ('FaceMatches' in face_match_data) {
                        for (var f in face_match_data.FaceMatches) {
                            if (face_match_data.FaceMatches[f].Similarity >= confidence_score) {
                              if ((face_match_data.FaceMatches[f].Face.ExternalImageId in FaceMatches) == false) {
                                // 02/13/2019 - V98480687 - bounding box fix
                                FaceMatches[face_match_data.FaceMatches[f].Face.ExternalImageId] = {};
                                FaceMatches[face_match_data.FaceMatches[f].Face.ExternalImageId]['ExternalImageId'] = face_match_data.FaceMatches[f].Face.ExternalImageId;
                                FaceMatches[face_match_data.FaceMatches[f].Face.ExternalImageId]['Impressions'] = [{'Timestamp':null,'Confidence':face_match_data.FaceMatches[f].Similarity, 'Face':{'FaceId': face_match_data.FaceMatches[f].Face.FaceId, 'BoundingBox': face_match_data.SearchedFaceBoundingBox}}];
                              }
                              else {
                                FaceMatches[face_match_data.FaceMatches[f].Face.ExternalImageId]['Impressions'].push({'Timestamp':null,'Confidence':face_match_data.FaceMatches[f].Similarity, 'Face':{'FaceId': face_match_data.FaceMatches[f].Face.FaceId, 'BoundingBox': face_match_data.SearchedFaceBoundingBox}});
                              }
                            }
                        }
                    }
                }
                for (var i in FaceMatches) {
                    face_match_out.FaceMatches.push(FaceMatches[i]);
                }
                return cb(null, face_match_out);
              }
          });
      }
      else if (lookup_type == 'entities') {

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results','entities.json'].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'entities', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building entity data output');
                let entity_data = JSON.parse(data.Body.toString('utf-8'));
                let Entities = {};
                let entities_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results','entities.json'].join('/')}, 'Entities':[]};

                for (var r in entity_data.ResultList) {
                    for (var e in entity_data.ResultList[r].Entities) {
                        if ((entity_data.ResultList[r].Entities[e].Score * 100) >= confidence_score) {
                            Entities[entity_data.ResultList[r].Entities[e].Text] = {};
                            Entities[entity_data.ResultList[r].Entities[e].Text]['Name'] = entity_data.ResultList[r].Entities[e].Text;
                            Entities[entity_data.ResultList[r].Entities[e].Text]['Impressions'] = [{'Timestamp':null, 'Score':entity_data.ResultList[r].Entities[e].Score}];
                        }
                    }

                }
                for (var i in Entities) {
                    entities_out.Entities.push(Entities[i]);
                }
                return cb(null, entities_out);
              }
          });
      }
      else if (lookup_type == 'phrases') {

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results','phrases.json'].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'phrases', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building phrase data output');
                let phrase_data = JSON.parse(data.Body.toString('utf-8'));
                let Phrases = {};
                let phrases_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results','phrases.json'].join('/')}, 'Phrases':[]};

                for (var r in phrase_data.ResultList) {
                    for (var p in phrase_data.ResultList[r].KeyPhrases) {
                      if ((phrase_data.ResultList[r].KeyPhrases[p].Score * 100) >= confidence_score) {
                          Phrases[phrase_data.ResultList[r].KeyPhrases[p].Text] = {};
                          Phrases[phrase_data.ResultList[r].KeyPhrases[p].Text]['Name'] = phrase_data.ResultList[r].KeyPhrases[p].Text;
                          Phrases[phrase_data.ResultList[r].KeyPhrases[p].Text]['Impressions'] = [{'Timestamp':null, 'Score':phrase_data.ResultList[r].KeyPhrases[p].Score}];
                      }
                    }
                }
                for (var i in Phrases) {
                    phrases_out.Phrases.push(Phrases[i]);
                }
                return cb(null, phrases_out);
              }
          });
      }
      else if (lookup_type == 'transcript') {

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results','transcript.json'].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'transcript', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building transcript data output');
                let transcript_data = JSON.parse(data.Body.toString('utf-8'));
                let transcript_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results','transcript.json'].join('/')}, 'Transcripts':[]};

                for (var t in transcript_data.results.transcripts) {
                    transcript_out.Transcripts.push({'Transcript':transcript_data.results.transcripts[t].transcript});
                }
                return cb(null, transcript_out);
              }
          });
      }
      else if (lookup_type == 'captions') {

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results','transcript.json'].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'captions', page_num, function(err, data) {
              if (err) {
                console.log(err);
                return cb(err, null);
              }
              else {
                console.log('Building captioning output');
                let captions_data = JSON.parse(data.Body.toString('utf-8'));
                let captions_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results','transcript.json'].join('/')}, 'Captions':[]};

                for (var i in captions_data.results.items) {
                    if (captions_data.results.items[i].type == 'pronunciation') {
                        let confidence = 0;
                        let content = '';
                        let ts = '';
                        for (var a in captions_data.results.items[i].alternatives) {
                            if (captions_data.results.items[i].alternatives[a].confidence > confidence) {
                                content = captions_data.results.items[i].alternatives[a].content;
                                ts = captions_data.results.items[i].start_time*1000;
                            }
                            captions_out.Captions.push({'Content':content,'Timestamp':ts});
                        }
                    }
                }
                return cb(null, captions_out);
              }
          });
      }
      else if (lookup_type == 'persons') {

          let filename = 'persons.json';
          if (page_num > 1) {
              filename = ['persons',page_num,'.json'].join('');
          }

          let s3_params = {
            Bucket: s3Bucket,
            Key: ['private',owner_id,'media',object_id,'results',filename].join('/')
          };

          retrieveData(s3_params, owner_id, object_id, 'persons', page_num, function(err, data) {
              if (err) {
                  console.log(err);
                  return cb(err, null);
              }
              else {
                  console.log('Building person focusing data output');
                  let persons_data = JSON.parse(data.Body.toString('utf-8'));
                  let persons_out = {'s3':{'bucket':s3Bucket,'key':['private',owner_id,'media',object_id,'results',filename].join('/')}, 'Persons':persons_data};

                  if (data.Next) {
                      persons_out['Next'] = data.Next;
                  }

                  return cb(null, persons_out);
              }
          });
      }
    };

    /**
      * Gets result from S3
      * @param {JSON} params - location of the result file
      * @param {string} owner_id - cognitoIdentityId of the requester
      * @param {string} object_id - uuid of the media object
      * @param {string} data_type - S3 object  requested
      * @param {int} page_num - result page number requested
      * @param {retrieveData~callback} cb - The callback that handles the response.
      */

     let retrieveData = function(params, owner_id, object_id, data_type, page_num, cb){
        let s3 = new AWS.S3();
        s3.getObject(params, function(err, data) {
            if (err) {
                console.log(err);
                return cb('Item does not exist or user does not have access',null);
            }
            else {
              let next_params = {
                  Bucket: s3Bucket,
                  Prefix: ['private',owner_id,'media',object_id,'results',data_type].join('/')
              };
              s3.listObjects(next_params, function(error, result) {
                  if (error) {
                      console.log(error);
                      return cb(error, null);
                  }
                  else {
                      let next_page;

                      if (result.Contents.length > page_num) {
                          let response = {
                              Body: data.Body,
                              Next: page_num + 1
                          };
                          return cb(null,response);
                      }
                      else {
                          let response = {
                              Body: data.Body
                          };
                          return cb(null,response);
                      }
                  }
              });
            }
        });
     };

    return lookup;

})();

module.exports = lookup;
