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
let Search = require('./search.js');
let Lookup = require('./lookup.js');
let Status = require('./status.js');
let Details = require('./details.js');

module.exports.respond = function(event, cb) {
    console.log(event);

    let _response = {};

    let INVALID_PATH_ERR = {
        Error: ['Invalid path request ', event.resource, ', ', event.httpMethod].join('')
    };



    if (event.resource === '/search') {
        let _search = new Search();
        _search.search(event.queryStringParameters.searchterm, Number(event.queryStringParameters.page), event.requestContext.identity.cognitoIdentityId, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return cb(_response, null);
            } else {
                console.log(data);
                _response = buildOutput(200, data);
                return cb(null, _response);
            }
        });
    }
    else if (event.resource == '/status/{object_id}') {
        let _status = new Status();
        _status.getStatus(event.pathParameters.object_id, event.requestContext.identity.cognitoIdentityId, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return cb(_response, null);
            }
            else {
                console.log(data);
                _response = buildOutput(200, data);
                return cb(null, _response);
            }
        });
    }
    else if (event.resource == '/lookup/{object_id+}') {
        let lookup_type;
        let object_id = event.pathParameters.object_id.split('/')[0];
        let request = event.pathParameters.object_id.split('/')[1];
        let page_num;

        if (event.queryStringParameters != null) {
          if (event.queryStringParameters.hasOwnProperty('page')) {
              page_num = event.queryStringParameters.page;
          }
          else {
              page_num = 1;
          }
        }
        else {
            page_num = 1;
        }
        console.log('Lookup type: ' + event.pathParameters.object_id.split('/')[1]);

        if (request.startsWith('celebs')) {
            lookup_type = 'celebs';
        }
        else if (request.startsWith('labels')) {
            lookup_type = 'labels';
        }
        else if (request.startsWith('faces')) {
            lookup_type = 'faces';
        }
        else if (request.startsWith('face_matches')) {
            lookup_type = 'face_matches';
        }
        else if (request.startsWith('entities')) {
            lookup_type = 'entities';
        }
        else if (request.startsWith('phrases')) {
            lookup_type = 'phrases';
        }
        else if (request.startsWith('persons')) {
            lookup_type = 'persons';
        }
        else if (request.startsWith('transcript')) {
            lookup_type = 'transcript';
        }
        else if (request.startsWith('captions')) {
            lookup_type = 'captions';
        }
        else {
            _response = buildOutput(500, INVALID_PATH_ERR);
            return cb(_response, null);
        }

        let _lookup = new Lookup();
        console.log(lookup_type);
        _lookup.getDetails(object_id,lookup_type, event.requestContext.identity.cognitoIdentityId, Number(page_num), function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return cb(_response, null);
            } else {
                console.log(data);
                _response = buildOutput(200, data);
                return cb(null, _response);
            }
        });
    }

    else if (event.resource == '/details/{object_id}') {
        let _details = new Details();
        _details.getDocument(event.pathParameters.object_id, event.requestContext.identity.cognitoIdentityId, function(err, data) {
            if (err) {
                console.log(err);
                _response = buildOutput(500, err);
                return cb(_response, null);
            }
            else {
                console.log(data);
                _response = buildOutput(200, data);
                return cb(null, _response);
            }
        });
    }
    else {
        _response = buildOutput(500, INVALID_PATH_ERR);
        return cb(_response, null);
    }
};

/**
 * Constructs the appropriate HTTP response.
 * @param {integer} statusCode - HTTP status code for the response.
 * @param {JSON} data - Result body to return in the response.
 */
function buildOutput(statusCode, data) {

    let _response = {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    };

    console.log(_response);

    return _response;
};
