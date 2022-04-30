import {db} from "../services/firebaseServices";
import * as collectionNames from "../constants/collectionNames";
import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";

export function setRecentUpdateForClientUsingBatch(clientId: string, message: string, batch: firestore.WriteBatch): void {
    batch.set(db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc(), {
        message: message,
        createdAt: firestore.Timestamp.now(),
    });
    return;
}

export async function setRecentUpdateForClient(clientId: string, message: string): Promise<void> {
    await db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc().set({
        message: message,
        createdAt: firestore.Timestamp.now(),
    });
    return;
}

export function setRecentUpdateForCoachUsingBatch(coachId: string, message: string, batch: firestore.WriteBatch): void {
    batch.set(db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc(), {
        message: message,
        createdAt: firestore.Timestamp.now(),
    });
    return;
}

export async function setRecentUpdateForCoach(coachId: string, message: string): Promise<void> {
    await db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc().set({
        message: message,
        createdAt: firestore.Timestamp.now(),
    });
    return;
}

export async function setRecentUpdateForCoachClientsUsingBatch(coachId: string, message: string, batch: firestore.WriteBatch): Promise<void> {
    const coachDocData: firestore.DocumentData | undefined = (await db.collection(collectionNames.coaches).doc(coachId).get()).data();
    if (typeof coachDocData !== "undefined") {
        const clientUIDs: string[] = coachDocData[fieldNames.clientUIDsField];
        clientUIDs.forEach(function (clientUID) {
            batch.set(db.collection(collectionNames.clients).doc(clientUID).collection(collectionNames.recentActivity).doc(), {
                message: message,
                createdAt: firestore.Timestamp.now(),
            });
        });
    }
    return;
}

// export async function setRecentUpdateForCoachClients(coachId: string, message: string) {
//     const coachDocData: firestore.DocumentData | undefined = (await db.collection(collectionNames.coaches).doc(coachId).get()).data();
//     if (typeof coachDocData !== "undefined") {
//         const clientUIDs: string[] = coachDocData[fieldNames.clientUIDsField];
//         clientUIDs.forEach(function (clientUID) {
//             db.collection(collectionNames.clients).doc(clientUID).collection(collectionNames.recentUpdates).doc().set({
//                 message: message,
//                 createdAt: firestore.Timestamp.now(),
//             });
//         });
//     }
//     return;
// }
