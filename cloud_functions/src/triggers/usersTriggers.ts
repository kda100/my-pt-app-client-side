import * as functions from "firebase-functions";
import * as fieldNames from "../constants/fieldNames";
import * as collectionNames from "../constants/collectionNames";
import {UsersHelper} from "../helpers/usersHelper";
import {ClientsHelper} from "../helpers/clientsHelper";
import {CoachesCollectionHelper} from "../helpers/coachesHelper";
import {clientsBucket, coachesBucket, db} from "../services/firebaseServices";
import {firestore} from "firebase-admin";

exports.onDeleteUser = functions.auth.user().onDelete(async (user) => {
    const userUID: string = user.uid;
    try {
        const userDocSnapshotData: FirebaseFirestore.DocumentData | undefined = await UsersHelper.getUserDocData(userUID);
        if (typeof userDocSnapshotData !== "undefined") {
            const batch = db.batch();
            if (userDocSnapshotData[fieldNames.isClientField]) {
                batch.delete(db.collection(collectionNames.clients).doc(userUID));
                const coachesDocsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await CoachesCollectionHelper.getCoachesWithClientUID(userUID);
                coachesDocsQuerySnapshot.forEach((coachDocSnapshot) => {
                    if (coachDocSnapshot.exists) {
                        batch.update(coachDocSnapshot.ref, {
                            clientUIDs: firestore.FieldValue.arrayRemove(userUID),
                        });
                    }
                    const clientManagementCoachDoc: firestore.DocumentReference<firestore.DocumentData> = db.collection(collectionNames.clientManagement).doc(coachDocSnapshot.id);
                    batch.delete(clientManagementCoachDoc.collection(collectionNames.myClients).doc(userUID));
                    batch.delete(clientManagementCoachDoc.collection(collectionNames.mealPlans).doc(userUID));
                    batch.delete(clientManagementCoachDoc.collection(collectionNames.exercisePlans).doc(userUID));
                    batch.delete(clientManagementCoachDoc.collection(collectionNames.coachChats).doc(userUID));
                    batch.delete(clientManagementCoachDoc.collection(collectionNames.clientPerformance).doc(userUID));
                });
                await clientsBucket.deleteFiles({prefix: `${userUID}/`});
            }

            if (userDocSnapshotData[fieldNames.isCoachField]) {
                batch.delete(db.collection(collectionNames.coaches).doc(userUID));
                const clientsDocsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> = await ClientsHelper.getClientsWithCoachUID(user.uid);
                clientsDocsQuerySnapshot.forEach((clientDocSnapshot) => {
                    if (clientDocSnapshot.exists) {
                        batch.update(clientDocSnapshot.ref, {
                            coachUID: "",
                        });
                    }
                });
                batch.delete(db.collection(collectionNames.clientManagement).doc(userUID));
                await coachesBucket.deleteFiles({prefix: `${userUID}/`});
            }
            await batch.commit();
        }
        await db.collection(collectionNames.users).doc(userUID).delete();
        functions.logger.log(`user ${user.email} ${userUID} deleted successfully`);
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(`${error.message} for user ${userUID}`);
        } else {
            console.log(`User ${userUID} references update failed`);
        }
    }
});
