import {db} from "../services/firebaseServices";
import * as collectionNames from "../constants/collectionNames";
import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import {RecentUpdate} from "../models/recentUpdate";

export class RecentUpdatesHelper {
    public static setRecentUpdateForClientUsingBatch(clientId: string, message: string, batch: firestore.WriteBatch): void {
        const recentUpdate: RecentUpdate = {
            message: message,
            createdAt: firestore.Timestamp.now(),
        };
        batch.set(db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc(), recentUpdate);
        return;
    }

    public static async setRecentUpdateForClient(clientId: string, message: string): Promise<void> {
        const recentUpdate: RecentUpdate = {
            message: message,
            createdAt: firestore.Timestamp.now(),
        };
        await db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc().set(recentUpdate);
        return;
    }

    public static setRecentUpdateForCoachUsingBatch(coachId: string, message: string, batch: firestore.WriteBatch): void {
        const recentUpdate: RecentUpdate = {
            message: message,
            createdAt: firestore.Timestamp.now(),
        };
        batch.set(db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc(), recentUpdate);
        return;
    }

    public static async setRecentUpdateForCoach(coachId: string, message: string): Promise<void> {
        const recentUpdate: RecentUpdate = {
            message: message,
            createdAt: firestore.Timestamp.now(),
        };
        await db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc().set(recentUpdate);
        return;
    }

    public static async setRecentUpdateForCoachClientsUsingBatch(coachId: string, message: string, batch: firestore.WriteBatch): Promise<void> {
        const coachDocData: firestore.DocumentData | undefined = (await db.collection(collectionNames.coaches).doc(coachId).get()).data();
        if (typeof coachDocData !== "undefined") {
            const clientUIDs: string[] = coachDocData[fieldNames.clientUIDsField];
            clientUIDs.forEach(function (clientUID) {
                const recentUpdate: RecentUpdate = {
                    message: message,
                    createdAt: firestore.Timestamp.now(),
                };
                batch.set(db.collection(collectionNames.clients).doc(clientUID).collection(collectionNames.recentActivity).doc(), recentUpdate);
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
}
