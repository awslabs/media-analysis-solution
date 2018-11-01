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

/**
 * Performs operations for interacting with MediaConvert
 *
 * @class MediaConvert
 */
let MediaConvert = (function() {

    /**
     * @class mediaConvert
     * @constructor
     */
    let mediaConvert = function() {};

    /**
     * Creates a MediaConvert job that create_job_response an audio file from the source file.
     * @param {JSON} state - The step function state object
     * @param {indexDocument~callback} cb - The callback that handles the response
     */
    mediaConvert.prototype.createJob = function(state, cb) {

      let pathArray = state.key.split('/');
      /**
      BUGFIX/media-analysis-35:: move Mediconvert output to a different directory to avoid triggering step functions.
      content is uploaded to s3://<bucvket>/private/ moving mc output to s3://<bucket>/mediaconvert/
      */
      let destinationPath = 'mediaconvert/'+pathArray.slice(0, pathArray.length -1).join('/');

      let destination = `s3://${process.env.S3_BUCKET}/${destinationPath}/`;
      let fileInput = `s3://${process.env.S3_BUCKET}/${state.key}`;

      var params = {
          "UserMetadata": {
            "SolutionID": process.env.SOLUTIONID
          },
          "Role": process.env.MEDIACONVERT_ROLE,
          "Settings": {
            "OutputGroups": [{
              "Name": "File Group",
              "Outputs": [{
                "ContainerSettings": {
                  "Container": "MP4",
                  "Mp4Settings": {
                    "CslgAtom": "INCLUDE",
                    "FreeSpaceBox": "EXCLUDE",
                    "MoovPlacement": "PROGRESSIVE_DOWNLOAD"
                  }
                },
                "AudioDescriptions": [{
                  "AudioTypeControl": "FOLLOW_INPUT",
                  "AudioSourceName": "Audio Selector 1",
                  "CodecSettings": {
                    "Codec": "AAC",
                    "AacSettings": {
                      "AudioDescriptionBroadcasterMix": "NORMAL",
                      "Bitrate": 96000,
                      "RateControlMode": "CBR",
                      "CodecProfile": "LC",
                      "CodingMode": "CODING_MODE_2_0",
                      "RawFormat": "NONE",
                      "SampleRate": 48000,
                      "Specification": "MPEG4"
                    }
                  },
                  "LanguageCodeControl": "FOLLOW_INPUT"
                }],
                "Extension": "mp4",
                "NameModifier": "_audio"
              }],
              "OutputGroupSettings": {
                "Type": "FILE_GROUP_SETTINGS",
                "FileGroupSettings": {
                  "Destination": destination
                }
              }
            }],
            "AdAvailOffset": 0,
            "Inputs": [{
              "AudioSelectors": {
                "Audio Selector 1": {
                  "Offset": 0,
                  "DefaultSelection": "DEFAULT",
                  "ProgramSelection": 1
                }
              },
              "VideoSelector": {
                "ColorSpace": "FOLLOW"
              },
              "FilterEnable": "AUTO",
              "PsiControl": "USE_PSI",
              "FilterStrength": 0,
              "DeblockFilter": "DISABLED",
              "DenoiseFilter": "DISABLED",
              "TimecodeSource": "EMBEDDED",
              "FileInput": fileInput
            }]
          }
      };

      let mediaconvert = new AWS.MediaConvert({
        region: process.env.AWS_REGION
      });

      mediaconvert.describeEndpoints().promise()
        .then(data => {
          mediaconvert = new AWS.MediaConvert({
            endpoint: data.Endpoints[0].Url,
            region: process.env.AWS_REGION
          });

          return mediaconvert.createJob(params).promise();
        })
        .then(data => {

          let resp = {
            jobDidStart: true,
            data: data
          }

          return cb(null, resp);

        })
        .catch(err => {
            console.log(err);
            return cb(err, null);
        });
    };

    /**
     * Queries MediaConvert for the status of a job.
     * @param {JSON} state - The step function state object
     * @param {indexDocument~callback} cb - The callback that handles the response
     */
    mediaConvert.prototype.getJobStatus = function(state, cb) {

      var mediaconvert = new AWS.MediaConvert({
        region: process.env.AWS_REGION
      });

      mediaconvert.describeEndpoints().promise()
        .then(data => {

          // Create a new MediaConvert object with an endpoint.
          mediaconvert = new AWS.MediaConvert({
            endpoint: data.Endpoints[0].Url,
            region: process.env.AWS_REGION
          });

          let params = {
            Id: state.mediaConvert.data.Job.Id
          };

          return mediaconvert.getJob(params).promise();
        })
        .then(data => {

          // Because the step that invokes this function writes to the root object,
          // create a copy of state to manipulate and return.
          let response = state;

          response.mediaConvert.status = data.Job.Status;

          /*
           BUGFIX/media-analysis-35:: move Mediconvert output to a different directory to avoid triggering step functions.
          content is uploaded to s3://<bucvket>/private/ moving mc output to s3://<bucket>/mediaconvert/
          new key is now handdled by transcribe.js
          */


          // If the MediaConvert job is complete, replace the filename with the new audio file.
          if (data.Job.Status == 'COMPLETE') {
            response.key = 'mediaconvert/'+state.key.split('.')[0]+'_audio.mp4';
            /*
            let oldKey = state.key;
            let outputs = data.Job.Settings.OutputGroups[0].Outputs[0];
            let nameModifier = outputs.NameModifier
            let extension = outputs.Extension

            // Remove the old extension and append the name modifier and new extension.
            let newKey = `${oldKey.split('.')[0]}${nameModifier}.${extension}`;
            */
            //response.key = newKey;
          }

          return cb(null, response);
        })
        .catch(err => {
          console.log(err);
          return cb(err, null);
        });
    };

    return mediaConvert;

})();

module.exports = MediaConvert;
