import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import * as collectionNames from "../constants/collectionNames";
import {db} from "../services/firebaseServices";
import * as storageNames from "../constants/storageNames";

export class CoachesCollectionHelper {
    public static async getCoachesWithClientUID(clientUID: string): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
        const coachesCollection: firestore.CollectionReference<firestore.DocumentData> = db.collection(collectionNames.coaches);
        return coachesCollection.where(fieldNames.clientUIDsField, "array-contains", clientUID).get();
    }

    public static getCoachProfilePicPath(coachUID: string): string {
        return `${coachUID}/${storageNames.profilePicFileName}`;
    }

    public static async getClientFullName(clientUID: string): Promise<string | undefined> {
        const docData: firestore.DocumentData | undefined = (await db.collection(collectionNames.clients).doc(clientUID).get()).data();
        if (typeof docData !== "undefined") {
            return docData[fieldNames.firstNameField] + docData[fieldNames.lastNameField];
        }
        return undefined;
    }
}
