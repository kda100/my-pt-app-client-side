"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachChatHelper = void 0;
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
class CoachChatHelper {
    static getLastMessage(coachId, clientId) {
        const chatContentItemsCollection = firebaseServices_1.db.collection(collectionNames.coachChats).doc(coachId).collection(collectionNames.clients).doc(clientId).collection(collectionNames.chatContentItems);
        return chatContentItemsCollection.orderBy(fieldNames.createdAtField).limitToLast(1).get();
    }
}
exports.CoachChatHelper = CoachChatHelper;
//# sourceMappingURL=coachChatHelper.js.map