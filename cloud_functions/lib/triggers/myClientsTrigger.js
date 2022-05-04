"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const strings = require("../constants/strings");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
exports.onUpdateMyClients = functions.firestore.document(`${collectionNames.clientManagement}/{coachId}/${collectionNames.myClients}/{clientId}`).onUpdate(async (change, context) => {
    const coachId = context.params.coachId;
    const clientDocAfter = change.after;
    const clientDocBefore = change.before;
    try {
        if (clientDocAfter.exists && clientDocBefore.exists) {
            const clientDocDataBefore = clientDocBefore.data();
            const clientDocDataAfter = clientDocAfter.data();
            const clientFullName = `${clientDocDataAfter[fieldNames.firstNameField]} ${clientDocDataAfter[fieldNames.lastNameField]}`;
            if (clientDocDataBefore[fieldNames.firstNameField] !== clientDocDataAfter[fieldNames.firstNameField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(coachId, `${clientFullName} has changed their first name`);
            }
            if (clientDocDataBefore[fieldNames.lastNameField] !== clientDocDataAfter[fieldNames.lastNameField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(coachId, `${clientFullName} has changed their last name`);
            }
            if (clientDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== clientDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(coachId, `${clientFullName} has changed their date of birth`);
            }
            if (clientDocDataBefore[fieldNames.phoneNumberField] !== clientDocDataAfter[fieldNames.phoneNumberField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(coachId, `${clientFullName} has changed their phone number`);
            }
            if (clientDocDataBefore[fieldNames.profilePicDownloadURLField] !== clientDocDataAfter[fieldNames.profilePicDownloadURLField]) {
                await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(coachId, `${clientFullName} have changed their profile picture`);
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
//# sourceMappingURL=myClientsTrigger.js.map