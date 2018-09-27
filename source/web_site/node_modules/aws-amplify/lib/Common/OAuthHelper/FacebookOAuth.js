"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var Common_1 = require("../../Common");
var logger = new Common_1.ConsoleLogger('CognitoCredentials');
var FacebookOAuth = /** @class */ (function () {
    function FacebookOAuth() {
    }
    FacebookOAuth.prototype.refreshFacebookToken = function () {
        var fb = window['FB'];
        if (!fb) {
            logger.debug('no fb sdk available');
            return Promise.reject('no fb sdk available');
        }
        return new Promise(function (res, rej) {
            fb.login(function (fbResponse) {
                if (!fbResponse || !fbResponse.authResponse) {
                    logger.debug('no response from facebook when refreshing the jwt token');
                    rej('no response from facebook when refreshing the jwt token');
                }
                var response = fbResponse.authResponse;
                var accessToken = response.accessToken, expiresIn = response.expiresIn;
                var date = new Date();
                var expires_at = expiresIn * 1000 + date.getTime();
                if (!accessToken) {
                    logger.debug('the jwtToken is undefined');
                    rej('the jwtToken is undefined');
                }
                res({ token: accessToken, expires_at: expires_at });
            }, { scope: 'public_profile,email' });
        });
    };
    return FacebookOAuth;
}());
exports.default = FacebookOAuth;
//# sourceMappingURL=FacebookOAuth.js.map