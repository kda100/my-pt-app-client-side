import * as functions from "firebase-functions";
import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import {db} from "../services/firebaseServices";
import * as collectionNames from "../constants/collectionNames";
import {getCoachesWithClientUID} from "../helpers/coachesHelper";
import {setRecentUpdateForClientUsingBatch} from "../helpers/recentUpdatesHelper";
// import * as storageNames from "../constants/storage_names";
// import * as strings from "../constants/strings";

exports.onUpdateClient = functions.firestore.document(`${collectionNames.clients}/{clientId}`).onUpdate(async (change, context) => {
    const clientId: string = context.params.clientId;
    const clientDocAfter: functions.firestore.QueryDocumentSnapshot = change.after;
    const clientDocBefore: functions.firestore.QueryDocumentSnapshot = change.before;

    if (clientDocAfter.exists && clientDocBefore.exists) {
        try {
            const batch: firestore.WriteBatch = db.batch();
            const clientDocDataBefore: firestore.DocumentData = clientDocBefore.data();
            const clientDocDataAfter: firestore.DocumentData = clientDocAfter.data();

            const beforeCoachUID: string = clientDocDataBefore[fieldNames.coachUIDField];
            const afterCoachUID: string = clientDocDataAfter[fieldNames.coachUIDField];

            if (beforeCoachUID !== afterCoachUID) {
                if (beforeCoachUID.length == 0 && afterCoachUID.length > 0) {
                    // no coach before and new coach added.
                } else if (beforeCoachUID.length > 0 && afterCoachUID.length > 0) {
                    // changed coach.
                } else if (beforeCoachUID.length > 0 && afterCoachUID.length == 0) {
                    // removed coach.
                }
            } else {
                addRecentUpdateDocForClient(clientId, batch, clientDocDataBefore, clientDocDataAfter);
                const coachesDocsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await getCoachesWithClientUID(clientId);
                coachesDocsQuerySnapshot.forEach((coachDocSnaphot) => {
                    if (coachDocSnaphot.exists) {
                        batch.update(db.collection(collectionNames.clientManagement).doc(coachDocSnaphot.id).collection(collectionNames.myClients).doc(clientId), {
                            firstName: clientDocDataAfter[fieldNames.firstNameField],
                            lastName: clientDocDataAfter[fieldNames.lastNameField],
                            dateOfBirth: clientDocDataAfter[fieldNames.dateOfBirthField],
                            phoneNumber: clientDocDataAfter[fieldNames.phoneNumberField],
                            profilePicDownloadURL: clientDocDataAfter[fieldNames.profilePicDownloadURLField],
                        });
                    }
                });
            }

            await batch.commit();
            console.log(`Client ${clientId} references updated successfully`);
        } catch (error) {
            if (error instanceof Error) {
                functions.logger.log(`${error.message} for client ${clientId}`);
            } else {
                console.log(`Client ${clientId} references update failed`);
            }
        }
    }
});

function addRecentUpdateDocForClient(clientId: string, batch: firestore.WriteBatch, clientDocDataBefore: firestore.DocumentData, clientDocDataAfter: firestore.DocumentData) {
    if (clientDocDataBefore[fieldNames.firstNameField] !== clientDocDataAfter[fieldNames.firstNameField]) {
        setRecentUpdateForClientUsingBatch(clientId, "You have changed your first name", batch);
    }
    if (clientDocDataBefore[fieldNames.lastNameField] !== clientDocDataAfter[fieldNames.lastNameField]) {
        setRecentUpdateForClientUsingBatch(clientId, "You have changed your last name", batch);
    }
    if (clientDocDataBefore[fieldNames.dateOfBirthField].toDate().getTime() !== clientDocDataAfter[fieldNames.dateOfBirthField].toDate().getTime()) {
        setRecentUpdateForClientUsingBatch(clientId, "You have changed your date of birth", batch);
    }
    if (clientDocDataBefore[fieldNames.phoneNumberField] !== clientDocDataAfter[fieldNames.phoneNumberField]) {
        setRecentUpdateForClientUsingBatch(clientId, "You have changed your phone number", batch);
    }
    if (clientDocDataBefore[fieldNames.profilePicDownloadURLField] !== clientDocDataAfter[fieldNames.profilePicDownloadURLField]) {
        setRecentUpdateForClientUsingBatch(clientId, "You have changed your profile picture", batch);
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
