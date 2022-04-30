import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import * as collectionNames from "../constants/collectionNames";
import {db} from "../services/firebaseServices";
import * as storageNames from "../constants/storageNames";

export async function getClientsWithCoachUID(coachUID: string): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
    const clientsCollection: firestore.CollectionReference<firestore.DocumentData> = db.collection(collectionNames.clients);
    return clientsCollection.where(fieldNames.coachUIDField, "==", coachUID).get();
}

export function getClientProfilePicPath(clientUID: string): string {
    return `${clientUID}/${storageNames.profilePicFileName}`;
}

export async function getClientFullName(clientUID: string): Promise<string> {
    const docData: firestore.DocumentData | undefined = (await db.collection(collectionNames.clients).doc(clientUID).get()).data();
    if (typeof docData !== "undefined") {
        return docData[fieldNames.firstNameField] + " " + docData[fieldNames.lastNameField];
    }
    return "A client";
}
