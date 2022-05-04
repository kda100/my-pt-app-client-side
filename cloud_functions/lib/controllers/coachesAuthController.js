"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const strings = require("../constants/strings");
const express_validator_1 = require("express-validator");
const validationHelper_1 = require("../helpers/validationHelper");
const firebaseServices_1 = require("../services/firebaseServices");
const coachesAuthApp = express();
coachesAuthApp.use(cors({ origin: true }));
coachesAuthApp.post("/coach_registration", validationHelper_1.ValidationHelper.userCreationValidators, async (req, res) => {
    var _a, _b;
    let userUID;
    const errors = express_validator_1.validationResult(req).formatWith(validationHelper_1.ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const userData = req.body;
        const email = userData[fieldNames.emailField];
        const password = userData[fieldNames.passwordField];
        const userRecord = await firebaseServices_1.auth.createUser({ email: email, password: password });
        userUID = userRecord.uid;
        const firstName = userData[fieldNames.firstNameField];
        const lastName = userData[fieldNames.lastNameField];
        const phoneNumber = (_a = userData[fieldNames.phoneNumberField]) !== null && _a !== void 0 ? _a : "";
        const dateOfBirth = admin.firestore.Timestamp.fromMillis(userData[fieldNames.dateOfBirthField]);
        const companyName = (_b = userData[fieldNames.companyNameField]) !== null && _b !== void 0 ? _b : "";
        const batch = firebaseServices_1.db.batch();
        const user = {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            isClient: false,
            isCoach: true,
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.users).doc(userUID), user);
        const coach = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            companyName: companyName,
            profilePicDownloadURL: "",
            clientUIDs: [],
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.coaches).doc(userUID), coach);
        const clientManagementCoach = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            companyName: companyName,
            profilePicDownloadURL: "",
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.clientManagement).doc(userUID), clientManagementCoach);
        await batch.commit();
        functions.logger.log("New Coach %s was created", userRecord.uid);
        return res.status(200).json({ message: "Registration successful" });
    }
    catch (error) {
        if (typeof userUID !== "undefined") {
            firebaseServices_1.auth.deleteUser(userUID);
        }
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({ message: error.message }).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({ message: strings.errorMessage }).send();
    }
});
coachesAuthApp.post("/check_coach_login", validationHelper_1.ValidationHelper.userLoginValidators, async (req, res) => {
    const errors = express_validator_1.validationResult(req).formatWith(validationHelper_1.ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const userData = req.body;
        const email = userData[fieldNames.emailField];
        const user = await firebaseServices_1.auth.getUserByEmail(email);
        const userDocSnapshot = await firebaseServices_1.db.collection(collectionNames.users).doc(user.uid).get();
        if (userDocSnapshot.exists) {
            const userDocSnapshotData = userDocSnapshot.data();
            if (typeof userDocSnapshotData !== "undefined") {
                if (userDocSnapshotData[fieldNames.isCoachField])
                    return res.status(200).json({ message: "Proceed with coach login" });
                else if (userDocSnapshotData[fieldNames.isClientField])
                    return res.status(300).json({ message: "You are registered as a client would you like to create a coach account?" });
            }
        }
        throw new Error(strings.errorMessage);
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({ message: error.message }).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({ message: strings.errorMessage }).send();
    }
});
coachesAuthApp.post("/create_coach_from_user", validationHelper_1.ValidationHelper.userLoginValidators, async (req, res) => {
    const errors = express_validator_1.validationResult(req).formatWith(validationHelper_1.ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const userData = req.body;
        const email = userData[fieldNames.emailField];
        const user = await firebaseServices_1.auth.getUserByEmail(email);
        const userDocRef = firebaseServices_1.db.collection(collectionNames.users).doc(user.uid);
        const userDocSnapshot = await userDocRef.get();
        if (userDocSnapshot.exists) {
            const userDocSnapshotData = userDocSnapshot.data();
            if (typeof userDocSnapshotData !== "undefined") {
                if (!userDocSnapshotData[fieldNames.isCoachField]) {
                    const batch = firebaseServices_1.db.batch();
                    batch.update(userDocRef, { isCoach: true });
                    const coach = {
                        firstName: userDocSnapshotData.firstName,
                        lastName: userDocSnapshotData.lastName,
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData.dateOfBirth,
                        email: email,
                        companyName: "",
                        profilePicDownloadURL: "",
                        clientUIDs: [],
                    };
                    batch.set(firebaseServices_1.db.collection(collectionNames.coaches).doc(user.uid), coach);
                    const clientManagementCoach = {
                        firstName: userDocSnapshotData.firstName,
                        lastName: userDocSnapshotData.lastName,
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData.dateOfBirth,
                        email: email,
                        companyName: "",
                        profilePicDownloadURL: "",
                    };
                    batch.set(firebaseServices_1.db.collection(collectionNames.clientManagement).doc(user.uid), clientManagementCoach);
                    await batch.commit();
                    return res.status(200).json({ message: "Creating coach successful" });
                }
            }
        }
        throw new Error("An error has occurred creating coach account");
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
            return res.status(400).json({ message: error.message }).send();
        }
        functions.logger.log(strings.errorMessage);
        return res.status(400).json({ message: "An error has occurred" }).send();
    }
});
exports.coachesAuth = functions.https.onRequest(coachesAuthApp);
//# sourceMappingURL=coachesAuthController.js.map