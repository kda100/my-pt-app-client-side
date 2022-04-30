import * as functions from "firebase-functions";
import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import * as collectionNames from "../constants/collectionNames";
import {setRecentUpdateForCoachClientsUsingBatch} from "../helpers/recentUpdatesHelper";
import {db} from "../services/firebaseServices";
import * as strings from "../constants/strings";

exports.onUpdateClientManagement = functions.firestore.document(`${collectionNames.clientManagement}/{coachId}`).onUpdate(async (change, context) => {
    const coachId: string = context.params.coachId;
    const coachDocAfter: functions.firestore.QueryDocumentSnapshot = change.after;
    const coachDocBefore: functions.firestore.QueryDocumentSnapshot = change.before;

    try {
        if (coachDocAfter.exists && coachDocBefore.exists) {
            const coachDocDataBefore: firestore.DocumentData = coachDocBefore.data();
            const coachDocDataAfter: firestore.DocumentData = coachDocAfter.data();
            const batch: firestore.WriteBatch = db.batch();

            if (coachDocDataBefore[fieldNames.firstNameField] !== coachDocDataAfter[fieldNames.firstNameField]) {
                await setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their first name", batch);
            }
            if (coachDocDataBefore[fieldNames.lastNameField] !== coachDocDataAfter[fieldNames.lastNameField]) {
                await setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their last name", batch);
            }
            if (coachDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== coachDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
                await setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their date of birth", batch);
            }
            if (coachDocDataBefore[fieldNames.phoneNumberField] !== coachDocDataAfter[fieldNames.phoneNumberField]) {
                await setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach has changed their phone number", batch);
            }
            if (coachDocDataBefore[fieldNames.profilePicDownloadURLField] !== coachDocDataAfter[fieldNames.profilePicDownloadURLField]) {
                await setRecentUpdateForCoachClientsUsingBatch(coachId, "Your coach have changed their profile picture", batch);
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
