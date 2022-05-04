"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersHelper = void 0;
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
class UsersHelper {
    static async getUserDocData(userUID) {
        const userDoc = firebaseServices_1.db.collection(collectionNames.users).doc(userUID);
        const userDocSnapshot = await userDoc.get();
        const userDocSnapshotData = userDocSnapshot.data();
        return userDocSnapshotData;
    }
}
exports.UsersHelper = UsersHelper;
//# sourceMappingURL=usersHelper.js.map