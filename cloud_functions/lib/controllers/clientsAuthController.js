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
const clientsAuthApp = express();
clientsAuthApp.use(cors({ origin: true }));
clientsAuthApp.post("/client_registration", validationHelper_1.ValidationHelper.userCreationValidators, async (req, res) => {
    var _a;
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
        const batch = firebaseServices_1.db.batch();
        const user = {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            isClient: true,
            isCoach: false,
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.users).doc(userUID), user);
        const client = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            email: email,
            profilePicDownloadURL: "",
            coachUID: "",
        };
        batch.set(firebaseServices_1.db.collection(collectionNames.clients).doc(userUID), client);
        await batch.commit();
        functions.logger.log("New client %s was created", userUID);
        return res.status(200).json({ message: "Registration successful" });
    }
    catch (error) {
        if (userUID !== undefined) {
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
clientsAuthApp.post("/check_client_login", validationHelper_1.ValidationHelper.userLoginValidators, async (req, res) => {
    const errors = express_validator_1.validationResult(req).formatWith(validationHelper_1.ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        functions.logger.log(errors.array());
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
                if (userDocSnapshotData[fieldNames.isClientField])
                    return res.status(200).json({ message: "Proceed with client login" });
                else if (userDocSnapshotData[fieldNames.isCoachField])
                    return res.status(300).json({ message: "You are registered as a coach would you like to create a client account?" });
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
clientsAuthApp.post("/create_client_from_user", validationHelper_1.ValidationHelper.userLoginValidators, async (req, res) => {
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
                if (!userDocSnapshotData[fieldNames.isClientField]) {
                    const batch = firebaseServices_1.db.batch();
                    batch.update(userDocRef, { isClient: true });
                    const client = {
                        firstName: userDocSnapshotData[fieldNames.firstNameField],
                        lastName: userDocSnapshotData[fieldNames.lastNameField],
                        phoneNumber: "",
                        dateOfBirth: userDocSnapshotData[fieldNames.dateOfBirthField],
                        email: email,
                        profilePicDownloadURL: "",
                        coachUID: "",
                    };
                    batch.set(firebaseServices_1.db.collection(collectionNames.clients).doc(user.uid), client);
                    await batch.commit();
                    return res.status(200).json({ message: "Creating client successful" });
                }
            }
        }
        throw new Error("An error has occurred creating client account");
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
exports.clientsAuth = functions.https.onRequest(clientsAuthApp);
//# sourceMappingURL=clientsAuthController.js.map