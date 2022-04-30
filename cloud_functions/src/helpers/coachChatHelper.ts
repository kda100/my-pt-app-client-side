import * as fieldNames from "../constants/fieldNames";
import {firestore} from "firebase-admin";
import * as collectionNames from "../constants/collectionNames";
import {db} from "../services/firebaseServices";

export function getLastMessage(coachId: string, clientId: string): Promise<firestore.QuerySnapshot<firestore.DocumentData>> {
    const chatContentItemsCollection: firestore.CollectionReference<firestore.DocumentData> = db.collection(collectionNames.coachChats).doc(coachId).collection(collectionNames.clients).doc(clientId).collection(collectionNames.chatContentItems);
    return chatContentItemsCollection.orderBy(fieldNames.createdAtField).limitToLast(1).get();
}
