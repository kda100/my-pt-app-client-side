"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const firebaseServices_1 = require("../services/firebaseServices");
const collectionNames = require("../constants/collectionNames");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
// import * as storageNames from "../constants/storage_names";
// import * as strings from "../constants/strings";
exports.onUpdateCoach = functions.firestore.document(`${collectionNames.coaches}/{coachId}`).onUpdate(async (change, context) => {
    const coachId = context.params.coachId;
    const coachDocBefore = change.before;
    const coachDocAfter = change.after;
    if (coachDocAfter.exists && coachDocBefore.exists) {
        const coachDocDataBefore = coachDocBefore.data();
        const coachDocDataAfter = change.after.data();
        try {
            const beforeClientUIDs = coachDocDataBefore[fieldNames.clientUIDsField];
            const afterClientUIDs = coachDocDataAfter[fieldNames.clientUIDsField];
            if (beforeClientUIDs.length !== afterClientUIDs.length) {
                if (beforeClientUIDs.length < afterClientUIDs.length) {
                    // client Added
                }
                else if (beforeClientUIDs.length > afterClientUIDs.length) {
                    // client removed
                }
            }
            else {
                const batch = firebaseServices_1.db.batch();
                addRecentUpdateDocForCoach(coachId, batch, coachDocDataBefore, coachDocDataAfter);
                const coachUpdate = {
                    firstName: coachDocDataAfter[fieldNames.firstNameField],
                    lastName: coachDocDataAfter[fieldNames.lastNameField],
                    dateOfBirth: coachDocDataAfter[fieldNames.dateOfBirthField],
                    phoneNumber: coachDocDataAfter[fieldNames.phoneNumberField],
                    profilePicDownloadURL: coachDocDataAfter[fieldNames.profilePicDownloadURLField],
                    companyName: coachDocDataAfter[fieldNames.companyNameField],
                };
                batch.update(firebaseServices_1.db.collection(collectionNames.clientManagement).doc(coachId), coachUpdate);
                await batch.commit();
                console.log(`Coach ${coachId} references updated successfully`);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                functions.logger.log(`${error.message} for coach ${coachId}`);
            }
            else {
                console.log(`Coach ${coachId} references update failed`);
            }
        }
    }
});
function addRecentUpdateDocForCoach(coachId, batch, coachDocDataBefore, coachDocDataAfter) {
    if (coachDocDataBefore[fieldNames.firstNameField] !== coachDocDataAfter[fieldNames.firstNameField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your first name", batch);
    }
    if (coachDocDataBefore[fieldNames.lastNameField] !== coachDocDataAfter[fieldNames.lastNameField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your last name", batch);
    }
    if (coachDocDataBefore[fieldNames.dateOfBirthField] !== coachDocDataAfter[fieldNames.dateOfBirthField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your date of birth", batch);
    }
    if (coachDocDataBefore[fieldNames.phoneNumberField] !== coachDocDataAfter[fieldNames.phoneNumberField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your phone number", batch);
    }
    if (coachDocDataBefore[fieldNames.profilePicDownloadURLField] !== coachDocDataAfter[fieldNames.profilePicDownloadURLField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your profile picture", batch);
    }
    if (coachDocDataBefore[fieldNames.companyNameField] !== coachDocDataAfter[fieldNames.companyNameField]) {
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have changed your company name", batch);
    }
}
// exports.onUpdateCoachStorage = functions.storage.bucket(storageNames.coachesBucketName).object().onFinalize(async object => {
//     try {
//         const pathNames: string[] | undefined = object.name?.split("/");
//         const coachId: string | undefined = object.owner?.entityId;
//         if (typeof pathNames !== "undefined" && typeof coachId !== "undefined") {
//             const fileName: string | undefined = pathNames[pathNames.length - 1];
//             if (coachId !== pathNames[1]) {
//                 throw Error("Coaches can only write to their own directories");
//             }
//             if (fileName === storageNames.profilePicFileName) {
//                 const downloadLink: string | undefined = object.mediaLink;
//                 if (typeof downloadLink !== "undefined") {
//                     await db.collection(collectionNames.clients).doc(coachId).update({
//                         profilePicDownloadURL: downloadLink,
//                     });
//                     functions.logger.log(`Coach ${coachId} profile picture updated successfully`);
//                 } else {
//                     throw Error("Invalid coach file uploaded");
//                 }
//             } else {
//                 throw Error("Coach file upload failed");
//             }
//         }
//     } catch (error) {
//         if (error instanceof Error) {
//             functions.logger.log(error.message);
//         }
//         functions.logger.log(strings.errorMessage);
//         if (object.name !== undefined) coachesBucket.file(object.name).delete();
//     }
// });
//# sourceMappingURL=coachesTriggers.js.map