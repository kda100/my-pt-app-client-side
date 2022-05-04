"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatsMediaBucket = exports.coachesBucket = exports.clientsBucket = exports.defaultBucket = exports.fcm = exports.db = exports.auth = void 0;
const admin = require("firebase-admin");
const storageNames = require("../constants/storageNames");
exports.auth = admin.auth();
exports.db = admin.firestore();
exports.fcm = admin.messaging();
exports.defaultBucket = admin.storage().bucket();
exports.clientsBucket = admin.storage().bucket(storageNames.clientsBucketName);
exports.coachesBucket = admin.storage().bucket(storageNames.coachesBucketName);
exports.chatsMediaBucket = admin.storage().bucket(storageNames.coachChatsMediaBucketName);
//# sourceMappingURL=firebaseServices.js.map