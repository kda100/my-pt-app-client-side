"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseMessagesHelper = void 0;
const firebaseServices_1 = require("../services/firebaseServices");
const collectionNames = require("../constants/collectionNames");
const fieldNames = require("../constants/fieldNames");
class FirebaseMessagesHelper {
    static async sendMessages(querySnapshot, title, body) {
        const tokens = [];
        querySnapshot.forEach(function (clientTokenDoc) {
            if (clientTokenDoc.exists) {
                const clientTokenDocData = clientTokenDoc.data();
                tokens.push(clientTokenDocData[fieldNames.tokenField]);
            }
        });
        if (tokens.length > 0) {
            const payload = {
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
            await firebaseServices_1.fcm.sendToDevice(tokens, payload);
        }
    }
    static async sendMessageToClient(clientUID, title, body) {
        const querySnapshot = (await firebaseServices_1.db.collection(collectionNames.clientTokens).where(fieldNames.clientUIDField, "==", clientUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }
    static async sendMessageToCoachClients(coachUID, title, body) {
        const querySnapshot = (await firebaseServices_1.db.collection(collectionNames.clientTokens).where(fieldNames.coachUIDField, "==", coachUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }
    static async sendMessageToCoach(coachUID, title, body) {
        const querySnapshot = (await firebaseServices_1.db.collection(collectionNames.coachTokens).where(fieldNames.coachUIDField, "==", coachUID).get()).docs;
        await this.sendMessages(querySnapshot, title, body);
    }
}
exports.FirebaseMessagesHelper = FirebaseMessagesHelper;
//# sourceMappingURL=firebaseMessagesHelper.js.map