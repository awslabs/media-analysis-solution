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
var GoogleOAuth = /** @class */ (function () {
    function GoogleOAuth() {
    }
    GoogleOAuth.prototype.refreshGoogleToken = function () {
        var ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
        if (!ga) {
            logger.debug('no gapi auth2 available');
            return Promise.reject('no gapi auth2 available');
        }
        return new Promise(function (res, rej) {
            ga.getAuthInstance().then(function (googleAuth) {
                if (!googleAuth) {
                    console.log('google Auth undefiend');
                    rej('google Auth undefiend');
                }
                var googleUser = googleAuth.currentUser.get();
                // refresh the token
                if (googleUser.isSignedIn()) {
                    logger.debug('refreshing the google access token');
                    googleUser.reloadAuthResponse()
                        .then(function (authResponse) {
                        var id_token = authResponse.id_token, expires_at = authResponse.expires_at;
                        var profile = googleUser.getBasicProfile();
                        var user = {
                            email: profile.getEmail(),
                            name: profile.getName()
                        };
                        res({ token: id_token, expires_at: expires_at });
                    });
                }
                else {
                    rej('User is not signed in with Google');
                }
            }).catch(function (err) {
                logger.debug('Failed to refresh google token', err);
                rej('Failed to refresh google token');
            });
        });
    };
    return GoogleOAuth;
}());
exports.default = GoogleOAuth;
//# sourceMappingURL=GoogleOAuth.js.map