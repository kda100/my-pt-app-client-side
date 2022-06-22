import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as fieldNames from "../constants/fieldNames";
import * as collectionNames from "../constants/collectionNames";
import * as strings from "../constants/strings";
import {UsersHelper} from "../helpers/usersHelper";
import {validationResult} from "express-validator";
import {UserRecord} from "firebase-functions/v1/auth";
import {ValidationHelper} from "../helpers/validationHelper";
import {auth, db} from "../services/firebaseServices";
import {NewUser} from "../models/user";
import {NewCoach, NewClientManagementCoach} from "../models/coach";
import {firestore} from "firebase-admin";
import {DecodedIdToken} from "firebase-admin/lib/auth/token-verifier";

const coachesApp = express();
coachesApp.use(cors({origin: true}));

coachesApp.post("/register", ValidationHelper.userCreationValidators, async (req: express.Request, res: express.Response) => {
    let userUID;
    const errors = validationResult(req).formatWith(ValidationHelper.authErrorFormatter);
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
        const companyName: string = userData[fieldNames.companyNameField] ?? "";

        const batch = db.batch();

        const user: NewUser = {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            isClient: false,
            isCoach: true,
        };
        batch.set(db.collection(collectionNames.users).doc(userUID), user);

        const coach: NewCoach = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            companyName: companyName,
            profilePicDownloadURL: "",
            clientUIDs: [],
        };
        batch.set(db.collection(collectionNames.coaches).doc(userUID), coach);

        const clientManagementCoach: NewClientManagementCoach = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            companyName: companyName,
            profilePicDownloadURL: "",
        };
        batch.set(db.collection(collectionNames.clientManagement).doc(userUID), clientManagementCoach);
        await batch.commit();
        functions.logger.log("New Coach %s was created", userRecord.uid);
        return res.status(201).json({message: "Registration successful"});
    } catch (error) {
        if (typeof userUID !== "undefined") {
            auth.deleteUser(userUID);
        }
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(500).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(500).json({message: strings.errorMessage}).send();
    }
});

coachesApp.post("/checklogin", ValidationHelper.userLoginValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        console.log(errors.array());
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
                if (userDocSnapshotData[fieldNames.isCoachField]) return res.status(200).json({message: "Proceed with coach login"});
                else if (userDocSnapshotData[fieldNames.isClientField]) return res.status(300).json({message: "You are registered as a client would you like to create a coach account?"});
            }
        }
        throw new Error(strings.errorMessage);
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(500).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(500).json({message: strings.errorMessage}).send();
    }
});

coachesApp.post("/createfromuser", ValidationHelper.userLoginValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(ValidationHelper.authErrorFormatter);
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
                if (!userDocSnapshotData[fieldNames.isCoachField]) {
                    const batch = db.batch();
                    batch.update(userDocRef, {isCoach: true});
                    const coach: NewCoach = {
                        firstName: userDocSnapshotData.firstName,
                        lastName: userDocSnapshotData.lastName,
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData.dateOfBirth,
                        email: email,
                        companyName: "",
                        profilePicDownloadURL: "",
                        clientUIDs: [],
                    };
                    batch.set(db.collection(collectionNames.coaches).doc(user.uid), coach);
                    const clientManagementCoach: NewClientManagementCoach = {
                        firstName: userDocSnapshotData.firstName,
                        lastName: userDocSnapshotData.lastName,
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData.dateOfBirth,
                        email: email,
                        companyName: "",
                        profilePicDownloadURL: "",
                    };
                    batch.set(db.collection(collectionNames.clientManagement).doc(user.uid), clientManagementCoach);
                    await batch.commit();
                    return res.status(201).json({message: "Creating coach successful"});
                }
            }
        }
        throw new Error("An error has occurred creating coach account");
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(500).json({message: error.message}).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(500).json({message: "An error has occurred"}).send();
    }
}
);

coachesApp.patch(`/:${strings.coachId}/edit`, ValidationHelper.userUpdateValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({error: errors.array()});
    }
    try {
        const decodedIdToken: DecodedIdToken | Error = await ValidationHelper.decodeFirebaseIdToken(req.headers.authorization);
        if (!(decodedIdToken instanceof Error)) {
            const userId = req.params[strings.coachId];
            if (userId === decodedIdToken.uid) {
                const clientData = req.body;

                const newFirstName: string = clientData[fieldNames.firstNameField];
                const newLastName: string = clientData[fieldNames.lastNameField];
                const newDateOfBirth: firestore.Timestamp = admin.firestore.Timestamp.fromMillis(clientData[fieldNames.dateOfBirthField]);

                const batch = db.batch();

                batch.update(db.collection(collectionNames.coaches).doc(userId), {
                    firstName: newFirstName,
                    lastName: newLastName,
                    dateOfBirth: newDateOfBirth,
                    phoneNumber: clientData[fieldNames.phoneNumberField] ?? "",
                    companyName: clientData[fieldNames.companyNameField] ?? "",
                });

                const userDocData: firestore.DocumentData | undefined = await UsersHelper.getUserDocData(userId);
                if (typeof userDocData !== "undefined") {
                    const oldfirstName: string = userDocData[fieldNames.firstNameField];
                    const oldLastName: string = userDocData[fieldNames.lastNameField];
                    const oldDateOfBirth: firestore.Timestamp = userDocData[fieldNames.dateOfBirthField];

                    if (newFirstName !== oldfirstName ||
                        newLastName !== oldLastName ||
                        oldDateOfBirth !== newDateOfBirth) {
                        const updates = {
                            firstName: newFirstName,
                            lastName: newLastName,
                            dateOfBirth: newDateOfBirth,
                        };
                        batch.update(
                            db.collection(collectionNames.users).doc(userId), updates,
                        );
                        if (userDocData[fieldNames.isClientField]) {
                            batch.update(db.collection(collectionNames.clients).doc(userId), updates);
                        }
                    }
                }
                await batch.commit();
                return res.status(201).json({message: "Coach details successfully updated"});
            } else {
                throw Error("User is not authorized to write this doc");
            }
        } else {
            throw decodedIdToken;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            return res.status(500).json({message: error.message}).send();
        }
        console.log(strings.errorMessage);
        return res.status(500).json({message: strings.errorMessage}).send();
    }
});

exports.coaches = functions.https.onRequest(coachesApp);
