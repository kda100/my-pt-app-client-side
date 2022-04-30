import * as functions from "firebase-functions";
import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import * as collectionNames from "../constants/collectionNames";
import * as strings from "../constants/strings";
import {setRecentUpdateForCoach} from "../helpers/recentUpdatesHelper";

exports.onUpdateMyClients = functions.firestore.document(`${collectionNames.clientManagement}/{coachId}/${collectionNames.myClients}/{clientId}`).onUpdate(async (change, context) => {
    const coachId: string = context.params.coachId;
    const clientDocAfter: functions.firestore.QueryDocumentSnapshot = change.after;
    const clientDocBefore: functions.firestore.QueryDocumentSnapshot = change.before;
    try {
        if (clientDocAfter.exists && clientDocBefore.exists) {
            const clientDocDataBefore: firestore.DocumentData = clientDocBefore.data();
            const clientDocDataAfter: firestore.DocumentData = clientDocAfter.data();
            const clientFullName = `${clientDocDataAfter[fieldNames.firstNameField]} ${clientDocDataAfter[fieldNames.lastNameField]}`;

            if (clientDocDataBefore[fieldNames.firstNameField] !== clientDocDataAfter[fieldNames.firstNameField]) {
                await setRecentUpdateForCoach(coachId, `${clientFullName} has changed their first name`);
            }
            if (clientDocDataBefore[fieldNames.lastNameField] !== clientDocDataAfter[fieldNames.lastNameField]) {
                await setRecentUpdateForCoach(coachId, `${clientFullName} has changed their last name`);
            }
            if (clientDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== clientDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
                await setRecentUpdateForCoach(coachId, `${clientFullName} has changed their date of birth`);
            }
            if (clientDocDataBefore[fieldNames.phoneNumberField] !== clientDocDataAfter[fieldNames.phoneNumberField]) {
                await setRecentUpdateForCoach(coachId, `${clientFullName} has changed their phone number`);
            }
            if (clientDocDataBefore[fieldNames.profilePicDownloadURLField] !== clientDocDataAfter[fieldNames.profilePicDownloadURLField]) {
                await setRecentUpdateForCoach(coachId, `${clientFullName} have changed their profile picture`);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});
