"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
// import {getLastMessage} from "../helpers/coachChatHelper";
const admin = require("firebase-admin");
const firebaseMessagesHelper_1 = require("../helpers/firebaseMessagesHelper");
// import * as admin from "firebase-admin";
// import * as storageNames from "../constants/storage_names";
const strings = require("../constants/strings");
const clientsHelper_1 = require("../helpers/clientsHelper");
// import * as path from "path";
// import * as cpp from "child-process-promise"
// import * as os from "os";
// import * as fs from "fs";
// import {UploadResponse} from "@google-cloud/storage";
const chatTextContentType = "text";
const chatContentsDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.coachChats}/{clientId}/${collectionNames.chatContentItems}/{chatContentItemId}`;
exports.onCreateChatContentItem = functions.firestore.document(chatContentsDocRefString).onCreate(async (snap, context) => {
    try {
        const newChatDocData = snap.data();
        if (typeof newChatDocData !== "undefined") {
            const now = admin.firestore.Timestamp.now();
            const coachId = context.params.coachId;
            const clientId = context.params.clientId;
            const sentBy = newChatDocData[fieldNames.sentByField];
            const content = newChatDocData[fieldNames.contentField];
            const chatContentItemType = newChatDocData[fieldNames.chatContentItemTypeField];
            await snap.ref.update({ createdAt: now, onCloud: true });
            // await db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.coachChats).doc(clientId).set({
            //     lastMessage: {
            //         chatContentItemType: chatContentItemType,
            //         content: content,
            //         createdAt: now,
            //         sentBy: sentBy,
            //         chatContentItemId: snap.id,
            //     },
            // });
            if (sentBy === coachId) {
                if (chatContentItemType == chatTextContentType) {
                    await firebaseMessagesHelper_1.sendMessageToClient(clientId, "New Message", `Your Coach: ${content}`);
                }
                else {
                    await firebaseMessagesHelper_1.sendMessageToClient(clientId, "New Message", "Your coach has sent you a new message");
                }
            }
            else if (sentBy === clientId) {
                const clientFullName = await clientsHelper_1.getClientFullName(clientId);
                if (clientFullName !== undefined) {
                    if (chatContentItemType == chatTextContentType) {
                        await firebaseMessagesHelper_1.sendMessageToCoach(coachId, "New Message", `${clientFullName}: ${content}`);
                    }
                    else {
                        await firebaseMessagesHelper_1.sendMessageToCoach(coachId, "New Message", `${clientFullName} has sent you a new message`);
                    }
                }
                else {
                    await firebaseMessagesHelper_1.sendMessageToCoach(coachId, "New Message", "You have a new message");
                }
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            functions.logger.log(strings.errorMessage);
        }
    }
});
exports.onDeleteChatContentItem = functions.firestore.document(chatContentsDocRefString).onDelete(async (snap, context) => {
    const coachId = context.params.coachId;
    const clientId = context.params.clientId;
    const chatContentItemId = context.params.chatContentItemId;
    try {
        const chatContentItemDocData = snap.data();
        if (typeof chatContentItemDocData !== "undefined") {
            const chatContentItemType = chatContentItemDocData[fieldNames.chatContentItemTypeField];
            if (chatContentItemType == "image") {
                const chatImageFile = firebaseServices_1.chatsMediaBucket.file(`${coachId}/${clientId}/images/${chatContentItemId}`);
                if ((await chatImageFile.exists())[0]) {
                    await chatImageFile.delete();
                }
            }
            if (chatContentItemType == "video") {
                await firebaseServices_1.chatsMediaBucket.deleteFiles({ prefix: `${coachId}/${clientId}/videos/${chatContentItemId}` });
            }
            // const lastMessageDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.coachChats).doc(clientId);
            // const lastMessageDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> = await lastMessageDocRef.get();
            // const lastMessageDocData: FirebaseFirestore.DocumentData | undefined = lastMessageDoc.data();
            // if (typeof lastMessageDocData !== "undefined") {
            //     const lastMessageChatContentItemId: string = lastMessageDocData[fieldNames.lastMessageField][fieldNames.chatContentItemIdField];
            //     if (lastMessageChatContentItemId === chatContentItemId) {
            //         const newLastMessageDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> = (await getLastMessage(coachId, clientId)).docs[0];
            //         if (newLastMessageDoc.exists) {
            //             const newLastMessageDocData: FirebaseFirestore.DocumentData | undefined = newLastMessageDoc.data();
            //             if (typeof newLastMessageDocData !== "undefined") {
            //                 lastMessageDocRef.set({
            //                     lastMessage: {
            //                         chatContentItemType: newLastMessageDocData[fieldNames.chatContentItemTypeField],
            //                         content: newLastMessageDocData[fieldNames.contentField],
            //                         createdAt: newLastMessageDocData[fieldNames.createdAtField],
            //                         sentBy: newLastMessageDocData[fieldNames.sentByField],
            //                         chatContentItemId: newLastMessageDoc.id,
            //                     },
            //                 });
            //             }
            //         }
            //     }
            // }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            functions.logger.log(strings.errorMessage);
        }
    }
});
// async function getNewChatContentItemsTotal(coachId: string, clientId: string, isIncrement: boolean): Promise<number | undefined> {
//     const clientCoachChatDocString = `${collectionNames.clientManagement}/${coachId}/${collectionNames.coachChats}/${clientId}`;
//     const clientCoachChatDocData: FirebaseFirestore.DocumentData | undefined = (await db.doc(clientCoachChatDocString).get()).data();
//     if (typeof clientCoachChatDocData !== "undefined") {
//         const currentTotalChatContentItemsField: number = clientCoachChatDocData[fieldNames.chatContentItemsTotalField];
//         console.log(isNaN(currentTotalChatContentItemsField));
//         if (isNaN(currentTotalChatContentItemsField)) {
//             return 1;
//         }
//         if (isIncrement) {
//             return currentTotalChatContentItemsField + 1;
//         } else {
//             return currentTotalChatContentItemsField - 1;
//         }
//     }
//     return undefined;
// }
// exports.onWriteChatContentItem = functions.firestore.document(`${collectionNames.coachClientChats}/{coachClientChatDocId}/${collectionNames.chatContentItems}/{chatContentItemId}`).onWrite(async (change, context) => {
//     const coachClientChatDocId: string = context.params.coachClientChatDocId;
//     const chatContentItemDocId: string = context.params.chatContentItemId;
//     try {
//         if (change.after.exists) {
//             const newChatDocData: FirebaseFirestore.DocumentData | undefined = change.after.data();
//             if (typeof newChatDocData !== "undefined") {
//                 const timestampNow: FirebaseFirestore.Timestamp = firestore.Timestamp.now();
//                 if (convertTimestampToMinutes(newChatDocData[fieldNames.createdAtField]) != convertTimestampToMinutes(timestampNow)) {
//                     db.doc(`${collectionNames.coachClientChats}/${coachClientChatDocId}/${collectionNames.chatContentItems}/${chatContentItemDocId}`).update({createdAt: timestampNow});
//                 }
//             }
//         } else {
//             const oldChatDocData: FirebaseFirestore.DocumentData | undefined = change.before.data();
//             if (typeof oldChatDocData !== "undefined") {
//                 const chatContentItemType: string = oldChatDocData[fieldNames.chatContentItemTypeField];
//                 if (chatContentItemType == "image") {
//                     const chatImageFile = chatsMediaBucket.file(`${coachClientChatDocId}/images/${change.before.id}`);
//                     if ((await chatImageFile.exists())[0]) {
//                         await chatImageFile.delete();
//                     }
//                 }
//                 if (chatContentItemType == "video") {
//                     await chatsMediaBucket.deleteFiles({prefix: `${coachClientChatDocId}/videos/${change.before.id}/`});
//                 }
//             }
//         }
//     } catch (error) {
//         if (error instanceof Error) {
//             functions.logger.log(error.message);
//         } else {
//             functions.logger.log(strings.errorMessage);
//         }
//     }
// });
// exports.onUploadChatMediaItem = functions.storage.bucket(storageNames.coachClientsChatsMediaBucketName).object().onFinalize(async object => {
//     try {
//         const filePath: string | undefined = object.name;
//         const contentType: string | undefined = object.contentType;
//         const senderId: string | undefined = object.owner?.entityId;
//         const fileDownloadLink: string | undefined = object.mediaLink;
//         if (typeof filePath !== "undefined" &&
//             typeof contentType !== "undefined" &&
//             typeof senderId !== "undefined" &&
//             typeof fileDownloadLink !== "undefined") {
//             const filePathNames: string[] = filePath.split("/");
//             const filePathNamesLength: number = filePathNames.length;
//             if (filePathNamesLength > 4) {
//                 throw Error("Invalid media item file path");
//             }
//             const fileName: string = filePathNames[filePathNamesLength - 1];
//             if (contentType.startsWith("image/") && fileName.endsWith("_thumbnail")) {
//                 return;
//             }
//             const dirName: string = filePathNames[filePathNamesLength - 2];
//             const coachClientChatId: string = filePathNames[filePathNamesLength - 3];
//             const coachClientIds: string[] = coachClientChatId.split("-");
//             const coachId: string = coachClientIds[0];
//             const clientId: string = coachClientIds[1];
//             if (coachId == senderId || clientId == senderId) {
//                 if (contentType.startsWith("image/") && dirName == "images") {
//                     db.collection(collectionNames.coachClientChats).doc(coachClientChatId).collection(collectionNames.chatContentItems).doc().set({
//                         chatContentItemType: "image",
//                         content: fileDownloadLink,
//                         createdAt: admin.database.ServerValue.TIMESTAMP,
//                         senderId: senderId,
//                     });
//                 } else if (contentType.startsWith("video/") && dirName == "videos") {
//                     const dirPath: string = path.dirname(filePath);
//                     const tempFilePath: string = path.join(os.tmpdir(), fileName);
//                     const metadata = {contentType: "image/png"};
//                     await chatsMediaBucket.file(filePath).download({destination: tempFilePath});
//                     const thmbFileName: string = `${fileName}_thumbnail.png`;
//                     const locatThmbFilePath: string = path.join(os.tmpdir(), thmbFileName);
//                     const remoteThmbFilePath: string = path.join(dirPath, thmbFileName);
//                     await cpp.spawn("ffmpeg", ["-i", tempFilePath, "-vframes", "1", "-an", "-s", "400X400", "-ss", "1", locatThmbFilePath]);
//                     const thmbUploadResponse: UploadResponse = await chatsMediaBucket.upload(locatThmbFilePath, {destination: remoteThmbFilePath, metadata: metadata, public: true, });
//                     fs.unlinkSync(locatThmbFilePath);
//                     fs.unlinkSync(tempFilePath);
//                     const thumbnailDownloadLink = await thmbUploadResponse[0].getSignedUrl({action: "read", expires: "03-01-2500"});
//                     db.collection(collectionNames.coachClientChats).doc(coachClientChatId).collection(collectionNames.chatContentItems).doc().set({
//                         chatContentItemType: "video",
//                         content: [fileDownloadLink, thumbnailDownloadLink],
//                         createdAt: admin.database.ServerValue.TIMESTAMP,
//                         senderId: senderId,
//                     });
//                 } else {
//                     throw Error("Invalid file type or file uploaded to wrong folder")
//                 }
//             } else {
//                 throw Error("Only coach and client involved in chat can write to this folder");
//             }
//         }
//     } catch (error) {
//         if (error instanceof Error) {
//             functions.logger.log(error.message);
//         }
//         functions.logger.log(strings.errorMessage);
//         if (object.name !== undefined) chatsMediaBucket.file(object.name).delete();
//     }
// });
//# sourceMappingURL=coachChatsTriggers.js.map