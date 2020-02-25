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
let creds = new AWS.EnvironmentCredentials('AWS');

/**
 * Helper function to interact with S3 on behalf of a
 * cfn custom resource
 *
 * @class s3helper
 */
let s3helper = (function() {

    /**
     * @class s3helper
     * @constructor
     */
    let s3helper = function() {};

    /**
     * Puts website configuration file to S3
     * @param {JSON} content - JSON config object
     * @param {string} destS3Bucket - name of the destination S3 bucket
     * @param {string} destS3Key - destination key of the config object
     * @param {putConfig~callback} cb - The callback that handles the response
     */
    s3helper.prototype.putConfig = function(content, destS3Bucket, destS3key, cb) {
        console.log(`Attempting to save content blob destination location: ${destS3Bucket}/${destS3key}`);

        let params = {
            Bucket: destS3Bucket,
            Key: destS3key,
            Body: content
        };

        // Upload JSON content to destination
        let s3 = new AWS.S3();
        s3.upload(params, function(err, data) {
            if (err) {
                console.log(err);
                return cb(`Failed to save content blob to ${destS3Bucket}/${destS3key}`, null);
            }
            else {
                return cb(null,'Successfully uploaded file to S3');
            }
        });
    };

    /**
     * Copies S3 assets from a source bucket to a destination bucket according
     * to a manifest file
     * @param {string} manifestKey - name of the manifest JSON file
     * @param {string} sourceS3Bucket - name of the source S3 bucket
     * @param {string} sourceS3prefix - S3 location of the manifest file
     * @param {string} destS3Bucket - name of the destination S3 bucket
     * @param {copyAssets~callback} cb - The callback that handles the response
     */
    s3helper.prototype.copyAssets = function(manifestKey, sourceS3Bucket, sourceS3prefix, destS3Bucket, cb) {

        // Download the manifest file
        downloadManifest(sourceS3Bucket, sourceS3prefix, function(err, data) {
            if (err) {
                console.log(err);
                return cb ('error retrieving manifest file');
            }
            else {
                var manifest = JSON.parse(data.Body.toString('utf-8'));
                // Copy the files from the source bucket to the destintation bucket
                uploadFiles(manifest.files, 0, destS3Bucket, `${sourceS3Bucket}/${sourceS3prefix}/web_site`, function(err, data) {
                      if (err) {
                          console.log(err);
                          return cb(err, null);
                      }
                      else {
                          console.log(data);
                          return cb(null, data);
                      }
                });
            }
        });
    };

    /**
     * Downloads the manifest file from the source bucket
     * @param {string} s3Bucket - S3 bucket where the manifest file is stored
     * @param {string} s3Key - S3 key of the manifest file
     * @param {downloadManifest~callback} cb - The callback that handles the response.
     */
    let downloadManifest = function(s3Bucket, s3Key, cb){

        var params = {
            Bucket: s3Bucket,
            Key: [s3Key,'site-manifest.json'].join('/')
        };

        console.log(`Attempting to download manifest`);

        let s3 = new AWS.S3();
        s3.getObject(params, function(err, data) {
            if (err) {
                console.log(err);
                return cb('Could not retrieve manifest file',null);
            }
            else {
                return cb(null,data);
            }
        });
    };

    /**
     * Parses the manifest files and copys them to to the destination bucket
     * @param {string} filelist - list of files to be copied
     * @param {integer} index - index of the file in the filelist
     * @param {string} destS3Bucket - S3 bucket to which the manifest file will be copied
     * @param {string} sourceS3prefix - S3 prefix of the file to be copied
     * @param {uploadFiles~callback} cb - The callback that handles the response.
     */
    let uploadFiles = function(filelist, index, destS3Bucket, sourceS3prefix, cb) {
        if (filelist.length > index) {
            let params = {
                Bucket: destS3Bucket,
                Key: filelist[index],
                CopySource: [sourceS3prefix, filelist[index]].join('/'),
                MetadataDirective: 'REPLACE'
            };

            let _contentType = 'binary/octet-stream';
            if (filelist[index].endsWith('.html')) {
                _contentType = 'text/html';
            } else if (filelist[index].endsWith('.css')) {
                _contentType = 'text/css';
            } else if (filelist[index].endsWith('.png')) {
                _contentType = 'image/png';
            } else if (filelist[index].endsWith('.svg')) {
                _contentType = 'image/svg+xml';
            } else if (filelist[index].endsWith('.jpg') || filelist[index].endsWith('.jpeg')) {
                _contentType = 'image/jpeg';
            } else if (filelist[index].endsWith('.js')) {
                _contentType = 'application/javascript';
            }

            params.ContentType = _contentType;
            params.Metadata = {
                'Content-Type': params.ContentType
            };

            let s3 = new AWS.S3();
            s3.copyObject(params, function(err, data) {
                if (err) {
                    return cb(`error copying ${sourceS3prefix}/${filelist[index]}\n${err}`,null);
                } else {
                    console.log(`${sourceS3prefix}/${filelist[index]} uploaded successfully`);
                    let _next = index + 1;
                    uploadFiles(filelist, _next, destS3Bucket, sourceS3prefix, cb);
                }
            });
        }
        else {
            return cb(null, `${index} files copied`);
        }
    };

    return s3helper;

})();

module.exports = s3helper;
