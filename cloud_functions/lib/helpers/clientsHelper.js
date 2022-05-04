"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsHelper = void 0;
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
const storageNames = require("../constants/storageNames");
class ClientsHelper {
    static async getClientsWithCoachUID(coachUID) {
        const clientsCollection = firebaseServices_1.db.collection(collectionNames.clients);
        return clientsCollection.where(fieldNames.coachUIDField, "==", coachUID).get();
    }
    static getClientProfilePicPath(clientUID) {
        return `${clientUID}/${storageNames.profilePicFileName}`;
    }
    static async getClientFullName(clientUID) {
        const docData = (await firebaseServices_1.db.collection(collectionNames.clients).doc(clientUID).get()).data();
        if (typeof docData !== "undefined") {
            return docData[fieldNames.firstNameField] + " " + docData[fieldNames.lastNameField];
        }
        return "A client";
    }
}
exports.ClientsHelper = ClientsHelper;
//# sourceMappingURL=clientsHelper.js.map