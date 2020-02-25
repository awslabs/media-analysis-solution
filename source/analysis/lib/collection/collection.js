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
 * Indexes face(s) in Amazon Rekognition
 *
 * @class collection
 */

 let collection = (function() {

   /**
    * @class collection
    * @constructor
    */
    let collection = function() {};

    /**
     * Performs indexing
     * @param {JSON} params - parameters for the indexing
     * @param {indexFace~callback} cb - The callback that handles the response.
     */

     collection.prototype.indexFace = function(params, cb) {
        console.log('Indexing new face(s)');

        let rekognition = new AWS.Rekognition();
        rekognition.indexFaces(params, function(err, data){
            if (err){
              return cb(err,null);
            }
            else {
              return cb(null,data);
            }
        });
     };

     collection.prototype.createCollection = function(collection_id, cb){
        console.log('Creating collection');

        let params = {
            CollectionId: collection_id
        };

        let rekognition = new AWS.Rekognition();
        rekognition.createCollection(params, function(err, data){
            if (err) {
                console.log('Error creating collection');
                cb(err, null);
            }
            else {
                console.log(data);
                cb(null,data);
            }
        });
     };

    return collection;

 })();

 module.exports = collection;
