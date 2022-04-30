import * as collectionNames from "../constants/collectionNames";
import {db} from "../services/firebaseServices";

export async function getUserDocData(userUID: string): Promise<FirebaseFirestore.DocumentData | undefined> {
    const userDoc: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection(collectionNames.users).doc(userUID);
    const userDocSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> = await userDoc.get();
    const userDocSnapshotData: FirebaseFirestore.DocumentData | undefined = userDocSnapshot.data();
    return userDocSnapshotData;
}
