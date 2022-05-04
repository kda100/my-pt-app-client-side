"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecentUpdatesHelper = void 0;
const firebaseServices_1 = require("../services/firebaseServices");
const collectionNames = require("../constants/collectionNames");
const fieldNames = require("../constants/fieldNames");
const firebase_admin_1 = require("firebase-admin");
class RecentUpdatesHelper {
    static setRecentUpdateForClientUsingBatch(clientId, message, batch) {
        const recentUpdate = {
            message: message,
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc(), recentUpdate);
        return;
    }
    static async setRecentUpdateForClient(clientId, message) {
        const recentUpdate = {
            message: message,
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
        };
        await firebaseServices_1.db.collection(collectionNames.clients).doc(clientId).collection(collectionNames.recentActivity).doc().set(recentUpdate);
        return;
    }
    static setRecentUpdateForCoachUsingBatch(coachId, message, batch) {
        const recentUpdate = {
            message: message,
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc(), recentUpdate);
        return;
    }
    static async setRecentUpdateForCoach(coachId, message) {
        const recentUpdate = {
            message: message,
            createdAt: firebase_admin_1.firestore.Timestamp.now(),
        };
        await firebaseServices_1.db.collection(collectionNames.coaches).doc(coachId).collection(collectionNames.recentActivity).doc().set(recentUpdate);
        return;
    }
    static async setRecentUpdateForCoachClientsUsingBatch(coachId, message, batch) {
        const coachDocData = (await firebaseServices_1.db.collection(collectionNames.coaches).doc(coachId).get()).data();
        if (typeof coachDocData !== "undefined") {
            const clientUIDs = coachDocData[fieldNames.clientUIDsField];
            clientUIDs.forEach(function (clientUID) {
                const recentUpdate = {
                    message: message,
                    createdAt: firebase_admin_1.firestore.Timestamp.now(),
                };
                batch.set(firebaseServices_1.db.collection(collectionNames.clients).doc(clientUID).collection(collectionNames.recentActivity).doc(), recentUpdate);
            });
        }
        return;
    }
}
exports.RecentUpdatesHelper = RecentUpdatesHelper;
//# sourceMappingURL=recentUpdatesHelper.js.map