import * as admin from "firebase-admin";
import * as storageNames from "../constants/storageNames";

export const auth = admin.auth();
export const db = admin.firestore();
export const fcm = admin.messaging();
export const defaultBucket = admin.storage().bucket();
export const clientsBucket = admin.storage().bucket(storageNames.clientsBucketName);
export const coachesBucket = admin.storage().bucket(storageNames.coachesBucketName);
export const chatsMediaBucket = admin.storage().bucket(storageNames.coachChatsMediaBucketName);
