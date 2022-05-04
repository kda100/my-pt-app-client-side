"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachesCollectionHelper = void 0;
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
const storageNames = require("../constants/storageNames");
class CoachesCollectionHelper {
    static async getCoachesWithClientUID(clientUID) {
        const coachesCollection = firebaseServices_1.db.collection(collectionNames.coaches);
        return coachesCollection.where(fieldNames.clientUIDsField, "array-contains", clientUID).get();
    }
    static getCoachProfilePicPath(coachUID) {
        return `${coachUID}/${storageNames.profilePicFileName}`;
    }
    static async getClientFullName(clientUID) {
        const docData = (await firebaseServices_1.db.collection(collectionNames.clients).doc(clientUID).get()).data();
        if (typeof docData !== "undefined") {
            return docData[fieldNames.firstNameField] + docData[fieldNames.lastNameField];
        }
        return undefined;
    }
}
exports.CoachesCollectionHelper = CoachesCollectionHelper;
//# sourceMappingURL=coachesHelper.js.map