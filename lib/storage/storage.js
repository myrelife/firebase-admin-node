/*! firebase-admin v5.7.0 */
"use strict";
/*!
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("../utils/error");
var credential_1 = require("../auth/credential");
var validator = require("../utils/validator");
/**
 * Internals of a Storage instance.
 */
var StorageInternals = /** @class */ (function () {
    function StorageInternals() {
    }
    /**
     * Deletes the service and its associated resources.
     *
     * @return {Promise<()>} An empty Promise that will be fulfilled when the service is deleted.
     */
    StorageInternals.prototype.delete = function () {
        // There are no resources to clean up.
        return Promise.resolve();
    };
    return StorageInternals;
}());
/**
 * Storage service bound to the provided app.
 */
var Storage = /** @class */ (function () {
    /**
     * @param {FirebaseApp} app The app for this Storage service.
     * @constructor
     */
    function Storage(app) {
        this.INTERNAL = new StorageInternals();
        if (!validator.isNonNullObject(app) || !('options' in app)) {
            throw new error_1.FirebaseError({
                code: 'storage/invalid-argument',
                message: 'First argument passed to admin.storage() must be a valid Firebase app instance.',
            });
        }
        var storage;
        try {
            /* tslint:disable-next-line:no-var-requires */
            storage = require('@google-cloud/storage');
        }
        catch (e) {
            throw new error_1.FirebaseError({
                code: 'storage/missing-dependencies',
                message: 'Failed to import the Cloud Storage client library for Node.js. '
                    + 'Make sure to install the "@google-cloud/storage" npm package.',
            });
        }
        var cert = app.options.credential.getCertificate();
        if (cert != null) {
            // cert is available when the SDK has been initialized with a service account JSON file,
            // or by setting the GOOGLE_APPLICATION_CREDENTIALS envrionment variable.
            this.storageClient = storage({
                credentials: {
                    private_key: cert.privateKey,
                    client_email: cert.clientEmail,
                },
            });
        }
        else if (app.options.credential instanceof credential_1.ApplicationDefaultCredential) {
            // Try to use the Google application default credentials.
            this.storageClient = storage();
        }
        else {
            throw new error_1.FirebaseError({
                code: 'storage/invalid-credential',
                message: 'Failed to initialize Google Cloud Storage client with the available credential. ' +
                    'Must initialize the SDK with a certificate credential or application default credentials ' +
                    'to use Cloud Storage API.',
            });
        }
        this.appInternal = app;
    }
    /**
     * Returns a reference to a Google Cloud Storage bucket. Returned reference can be used to upload
     * and download content from Google Cloud Storage.
     *
     * @param {string=} name Optional name of the bucket to be retrieved. If name is not specified,
     *   retrieves a reference to the default bucket.
     * @return {Bucket} A Bucket object from the @google-cloud/storage library.
     */
    Storage.prototype.bucket = function (name) {
        var bucketName;
        if (typeof name !== 'undefined') {
            bucketName = name;
        }
        else {
            bucketName = this.appInternal.options.storageBucket;
        }
        if (validator.isNonEmptyString(bucketName)) {
            return this.storageClient.bucket(bucketName);
        }
        throw new error_1.FirebaseError({
            code: 'storage/invalid-argument',
            message: 'Bucket name not specified or invalid. Specify a valid bucket name via the ' +
                'storageBucket option when initializing the app, or specify the bucket name ' +
                'explicitly when calling the getBucket() method.',
        });
    };
    Object.defineProperty(Storage.prototype, "app", {
        /**
         * Returns the app associated with this Storage instance.
         *
         * @return {FirebaseApp} The app associated with this Storage instance.
         */
        get: function () {
            return this.appInternal;
        },
        enumerable: true,
        configurable: true
    });
    return Storage;
}());
exports.Storage = Storage;
;
