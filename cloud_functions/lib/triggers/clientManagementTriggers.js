"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
const firebaseServices_1 = require("../services/firebaseServices");
const strings = require("../constants/strings");
exports.onUpdateClientManagement = functions.firestore.document(`${collectionNames.clientManagement}/{coachId}`).onUpdate(async (change, context) => {
    const coachId = context.params.coachId;
    const coachDocAfter = change.after;
    const coachDocBefore = change.before;
    try {
        if (coachDocAfter.exists && coachDocBefore.exists) {
            const coachDocDataBefore = coachDocBefore.data();
            const coachDocDataAfter = coachDocAfter.data();
            const batch = firebaseServices_1.db.batch();
            if (coachDocDataBefore[fieldNames.firstNameField] !== coachDocDataAfter[fieldNames.firstNameField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their first name", batch);
            }
            if (coachDocDataBefore[fieldNames.lastNameField] !== coachDocDataAfter[fieldNames.lastNameField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their last name", batch);
            }
            if (coachDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== coachDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their date of birth", batch);
            }
            if (coachDocDataBefore[fieldNames.phoneNumberField] !== coachDocDataAfter[fieldNames.phoneNumberField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their phone number", batch);
            }
            if (coachDocDataBefore[fieldNames.profilePicDownloadURLField] !== coachDocDataAfter[fieldNames.profilePicDownloadURLField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach have changed their profile picture", batch);
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            console.log(strings.errorMessage);
        }
    }
});
//# sourceMappingURL=clientManagementTriggers.js.map