import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as fieldNames from "../constants/fieldNames";
import * as collectionNames from "../constants/collectionNames";
import * as strings from "../constants/strings";
import {validationResult} from "express-validator";
import {UserRecord} from "firebase-functions/v1/auth";
import {authErrorFormatter, userCreationValidators, userLoginValidators} from "../helpers/validationHelper";
import {auth, db} from "../services/firebaseServices";


const clientsAuthApp = express();
clientsAuthApp.use(cors({origin: true}));

clientsAuthApp.post("/client_registration", userCreationValidators, async (req: express.Request, res: express.Response) => {
    let userUID;

    const errors = validationResult(req).formatWith(authErrorFormatter);
    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
        return res.status(400).json({error: errors.array()});
    }

    try {
        const userData = req.body;

        const email: string = userData[fieldNames.emailField];
        const password: string = userData[fieldNames.passwordField];

        const userRecord: UserRecord = await auth.createUser({email: email, password: password});
        userUID = userRecord.uid;


        const firstName: string = userData[fieldNames.firstNameField];
        const lastName: string = userData[fieldNames.lastNameField];
        const phoneNumber: string = userData[fieldNames.phoneNumberField] ?? "";
        const dateOfBirth: FirebaseFirestore.Timestamp = admin.firestore.Timestamp.fromMillis(userData[fieldNames.dateOfBirthField]);


        const batch = db.batch();

        batch.set(db.collection(collectionNames.users).doc(userUID), {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            isClient: true,
            isCoach: false,
        });

        batch.set(db.collection(collectionNames.clients).doc(userUID), {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            profilePicDownloadURL: "",
            coachUID: "",
        });

        await batch.commit();
        functions.logger.log("New client %s was created", userUID);
        return res.status(200).json({message: "Registration successful"});
    } catch (error) {
        if (userUID !== undefined) {
            auth.deleteUser(userUID);
        }
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({message: strings.errorMessage}).send();
    }
});

clientsAuthApp.post("/check_client_login", userLoginValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(authErrorFormatter);

    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
        return res.status(400).json({error: errors.array()});
    }

    try {
        const userData = req.body;

        const email: string = userData[fieldNames.emailField];
        const user: UserRecord = await auth.getUserByEmail(email);
        const userDocSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> = await db.collection(collectionNames.users).doc(user.uid).get();
        if (userDocSnapshot.exists) {
            const userDocSnapshotData: FirebaseFirestore.DocumentData | undefined = userDocSnapshot.data();
            if (typeof userDocSnapshotData !== "undefined") {
                if (userDocSnapshotData[fieldNames.isClientField]) return res.status(200).json({message: "Proceed with client login"});
                else if (userDocSnapshotData[fieldNames.isCoachField]) return res.status(300).json({message: "You are registered as a coach would you like to create a client account?"});
            }
        }
        throw new Error(strings.errorMessage);
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({message: strings.errorMessage}).send();
    }
});

clientsAuthApp.post("/create_client_from_user", userLoginValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(authErrorFormatter);
    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
        return res.status(400).json({error: errors.array()});
    }

    try {
        const userData = req.body;
        const email: string = userData[fieldNames.emailField];
        const user: UserRecord = await auth.getUserByEmail(email);
        const userDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection(collectionNames.users).doc(user.uid);
        const userDocSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> = await userDocRef.get();
        if (userDocSnapshot.exists) {
            const userDocSnapshotData: FirebaseFirestore.DocumentData | undefined = userDocSnapshot.data();
            if (typeof userDocSnapshotData !== "undefined") {
                if (!userDocSnapshotData[fieldNames.isClientField]) {
                    const batch = db.batch();
                    batch.update(userDocRef, {isClient: true});
                    batch.set(db.collection(collectionNames.clients).doc(user.uid), {
                        firstName: userDocSnapshotData[fieldNames.firstNameField],
                        lastName: userDocSnapshotData[fieldNames.lastNameField],
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData[fieldNames.dateOfBirthField],
                        email: email,
                        profilePicDownloadURL: "",
                        coachUID: "",
                    });
                    await batch.commit();
                    return res.status(200).json({message: "Creating client successful"});
                }
            }
        }
        throw new Error("An error has occurred creating client account");
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({message: strings.errorMessage}).send();
    }
}
);

exports.clientsAuth = functions.https.onRequest(clientsAuthApp);
