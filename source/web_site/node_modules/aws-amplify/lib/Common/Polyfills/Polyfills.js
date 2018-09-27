"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var InMemoryCache_1 = require("../../Cache/InMemoryCache");
if (!global.window) {
    global.window = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        WebSocket: global.WebSocket,
        ArrayBuffer: global.ArrayBuffer,
        addEventListener: function () { },
        navigator: { onLine: true }
    };
}
if (!global.localStorage) {
    global.localStorage = InMemoryCache_1.default;
}
//# sourceMappingURL=Polyfills.js.map