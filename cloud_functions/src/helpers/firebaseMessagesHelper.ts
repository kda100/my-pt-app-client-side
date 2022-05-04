import {db, fcm} from "../services/firebaseServices";
import * as collectionNames from "../constants/collectionNames";
import * as fieldNames from "../constants/fieldNames";
import * as admin from "firebase-admin";

export class FirebaseMessagesHelper {
    private static async sendMessages(querySnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[], title: string, body: string) {
        const tokens: string[] = [];
        querySnapshot.forEach(function (clientTokenDoc) {
            if (clientTokenDoc.exists) {
                const clientTokenDocData: FirebaseFirestore.DocumentData = clientTokenDoc.data();
                tokens.push(clientTokenDocData[fieldNames.tokenField]);
            }
        });
        if (tokens.length > 0) {
            const payload: admin.messaging.MessagingPayload = {
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    clickAction: "FLUTTER_NOTIFICATION_CLICK",
                    sound: "default",
                    status: "done",
                },
            };
            await fcm.sendToDevice(tokens, payload);
        }
    }

    public static async sendMessageToClient(clientUID: string, title: string, body: string): Promise<void> {
        const querySnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = (await db.collection(collectionNames.clientTokens).where(fieldNames.clientUIDField, "==", clientUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }

    public static async sendMessageToCoachClients(coachUID: string, title: string, body: string): Promise<void> {
        const querySnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = (await db.collection(collectionNames.clientTokens).where(fieldNames.coachUIDField, "==", coachUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }

    public static async sendMessageToCoach(coachUID: string, title: string, body: string): Promise<void> {
        const querySnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = (await db.collection(collectionNames.coachTokens).where(fieldNames.coachUIDField, "==", coachUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }
}
