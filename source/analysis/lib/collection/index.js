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
let Collection = require('./collection.js');

module.exports.respond = function(params, cb) {

    let _collection = new Collection();
    _collection.indexFace(params, function(err, data) {
      if (err) {
          console.log(err);
          if (err.code == 'ResourceNotFoundException') {
              console.log('Collection does not exist');
              _collection.createCollection(params.CollectionId, function(err, data){
                  if (err) {
                    console.log(err);
                    return cb(err, null);
                  }
                  else {
                      console.log('Created collection');
                      _collection.indexFace(params, function(err, data) {
                          if (err) {
                              console.log(err);
                              return cb(err,null);
                          }
                          else {
                              console.log(data);
                              return cb(null,data);
                          }
                      });
                  }
              });
          }
          else {
              console.log(err,null);
              return cb(err, null);
          }
      }
      else {
          console.log(data);
          return cb(null, data);
      }
    });
};
