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
const endpoint = process.env.DOMAIN_ENDPOINT;
const es_index = process.env.ES_INDEX;
const es_version = process.env.ES_VERSION;
const search_result_limit = parseInt(process.env.SEARCH_RESULT_LIMIT);

/**
 * Performs search operations on the ElasticSearch cluster
 *
 * @class search
 */
let search = (function() {

    /**
     * @class search
     * @constructor
     */
    let search = function() {};

    /**
     * Performs search on media analysis elasticsearch cluster using the
     * keyword terms provided.
     * @param {string} search_term - Keyword terms to search.
     * @param {string} page_num - Search for term in this field.
     * @param {string} owner_id - cognitoIdentityId of the requester.
     * @param {search~requestCallback} cb - The callback that handles the response.
     */
    search.prototype.search = function(search_term, page_num, owner_id, cb) {

      console.log('search for term: \'' + search_term + '\'');
      console.log('searching...');

      let search_body = {
        'query': {
          'bool': {
            'must': {
              'query_string': {
                'query': search_term
              }
            },
            'filter': {
              'term':  {
                'owner_id.keyword': owner_id
              }
            }
          }
        }
      };

      let client = require('elasticsearch').Client({
          hosts: endpoint,
          connectionClass: require('http-aws-es'),
          amazonES: {
            region: process.env.AWS_REGION,
            credentials: creds
          },
          apiVersion: es_version
      });

      client.search({
        index: es_index,
        body: search_body,
        from: (page_num - 1) * search_result_limit,
        size: search_result_limit
      }).then(function(body) {
          let _results = {
              Items: []
          };
          _results['total'] = body.hits.total;

          for (let i = 0; i < body.hits.hits.length; i++) {
              console.log(body.hits.hits);
              let output = {
                  name: body.hits.hits[i]._source.name,
                  file_type: body.hits.hits[i]._source.file_type,
                  media_id: body.hits.hits[i]._source.object_id,
                  thumbnail: body.hits.hits[i]._source.key.split('/').slice(2).join('/'),
                  upload_time: body.hits.hits[i]._source.upload_time
              };
              console.log(output);
              _results.Items.push(output);
          }
          console.log(_results);

          cb(null, _results);
      }, function(error) {
          console.trace(error.message);
          cb(error, null);
      });
    };

    return search;

})();

module.exports = search;
