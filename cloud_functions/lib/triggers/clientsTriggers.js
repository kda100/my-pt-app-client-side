"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const firebaseServices_1 = require("../services/firebaseServices");
const collectionNames = require("../constants/collectionNames");
const coachesHelper_1 = require("../helpers/coachesHelper");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
// import * as storageNames from "../constants/storage_names";
// import * as strings from "../constants/strings";
exports.onUpdateClient = functions.firestore.document(`${collectionNames.clients}/{clientId}`).onUpdate(async (change, context) => {
    const clientId = context.params.clientId;
    const clientDocAfter = change.after;
    const clientDocBefore = change.before;
    if (clientDocAfter.exists && clientDocBefore.exists) {
        try {
            const batch = firebaseServices_1.db.batch();
            const clientDocDataBefore = clientDocBefore.data();
            const clientDocDataAfter = clientDocAfter.data();
            const beforeCoachUID = clientDocDataBefore[fieldNames.coachUIDField];
            const afterCoachUID = clientDocDataAfter[fieldNames.coachUIDField];
            if (beforeCoachUID !== afterCoachUID) {
                if (beforeCoachUID.length == 0 && afterCoachUID.length > 0) {
                    // no coach before and new coach added.
                }
                else if (beforeCoachUID.length > 0 && afterCoachUID.length > 0) {
                    // changed coach.
                }
                else if (beforeCoachUID.length > 0 && afterCoachUID.length == 0) {
                    // removed coach.
                }
            }
            else {
                addRecentUpdateDocForClient(clientId, batch, clientDocDataBefore, clientDocDataAfter);
                const coachesDocsQuerySnapshot = await coachesHelper_1.CoachesCollectionHelper.getCoachesWithClientUID(clientId);
                coachesDocsQuerySnapshot.forEach((coachDocSnaphot) => {
                    if (coachDocSnaphot.exists) {
                        const updateClient = {
                            firstName: clientDocDataAfter[fieldNames.firstNameField],
                            lastName: clientDocDataAfter[fieldNames.lastNameField],
                            dateOfBirth: clientDocDataAfter[fieldNames.dateOfBirthField],
                            phoneNumber: clientDocDataAfter[fieldNames.phoneNumberField],
                            profilePicDownloadURL: clientDocDataAfter[fieldNames.profilePicDownloadURLField],
                        };
                        batch.update(firebaseServices_1.db.collection(collectionNames.clientManagement).doc(coachDocSnaphot.id).collection(collectionNames.myClients).doc(clientId), updateClient);
                    }
                });
            }
            await batch.commit();
            console.log(`Client ${clientId} references updated successfully`);
        }
        catch (error) {
            if (error instanceof Error) {
                functions.logger.log(`${error.message} for client ${clientId}`);
            }
            else {
                console.log(`Client ${clientId} references update failed`);
            }
        }
    }
});
function addRecentUpdateDocForClient(clientId, batch, clientDocDataBefore, clientDocDataAfter) {
    if (clientDocDataBefore[fieldNames.firstNameField] !== clientDocDataAfter[fieldNames.firstNameField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, "You have changed your first name", batch);
    }
    if (clientDocDataBefore[fieldNames.lastNameField] !== clientDocDataAfter[fieldNames.lastNameField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, "You have changed your last name", batch);
    }
    if (clientDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== clientDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, "You have changed your date of birth", batch);
    }
    if (clientDocDataBefore[fieldNames.phoneNumberField] !== clientDocDataAfter[fieldNames.phoneNumberField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, "You have changed your phone number", batch);
    }
    if (clientDocDataBefore[fieldNames.profilePicDownloadURLField] !== clientDocDataAfter[fieldNames.profilePicDownloadURLField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, "You have changed your profile picture", batch);
    }
}
// exports.onUpdateClientStorage = functions.storage.bucket(storageNames.clientsBucketName).object().onFinalize(async object => {
//     try {
//         const pathNames: string[] | undefined = object.name?.split("/");
//         const clientId: string | undefined = object.owner?.entityId;
//         if (typeof pathNames !== "undefined" && typeof clientId !== "undefined") {
//             const fileName: string | undefined = pathNames[pathNames.length - 1];
//             if (clientId !== pathNames[1]) {
//                 throw Error("Clients can only write to their own directories");
//             }
//             if (fileName === storageNames.profilePicFileName) {
//                 const downloadLink: string | undefined = object.mediaLink;
//                 if (typeof downloadLink !== "undefined") {
//                     await db.collection(collectionNames.clients).doc(clientId).update({
//                         profilePicDownloadURL: downloadLink,
//                     });
//                     functions.logger.log(`Client ${clientId} profile picture updated successfully`);
//                 }
//             } else {
//                 throw Error("Invalid client file uploaded");
//             }
//         } else {
//             throw Error("Client file upload failed");
//         }
//     } catch (error) {
//         if (error instanceof Error) {
//             functions.logger.log(error.message);
//         }
//         functions.logger.log(strings.errorMessage);
//         if (object.name !== undefined) clientsBucket.file(object.name).delete();
//     }
// });
//# sourceMappingURL=clientsTriggers.js.map