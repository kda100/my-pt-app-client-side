"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// import * as admin from "firebase-admin";
const express = require("express");
const cors = require("cors");
const strings = require("../constants/strings");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const validationHelper_1 = require("../helpers/validationHelper");
const express_validator_1 = require("express-validator");
const firebaseServices_1 = require("../services/firebaseServices");
const usersHelper_1 = require("../helpers/usersHelper");
const admin = require("firebase-admin");
const clientsApp = express();
clientsApp.use(cors({ origin: true }));
clientsApp.post(`/update_client_details/:${strings.clientId}`, validationHelper_1.ValidationHelper.userUpdateValidators, async (req, res) => {
    var _a;
    const errors = express_validator_1.validationResult(req).formatWith(validationHelper_1.ValidationHelper.authErrorFormatter);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const decodedIdToken = await validationHelper_1.ValidationHelper.decodeFirebaseIdToken(req.headers.authorization);
        if (!(decodedIdToken instanceof Error)) {
            const userId = req.params[strings.clientId];
            if (userId === decodedIdToken.uid) {
                const clientData = req.body;
                const newFirstName = clientData[fieldNames.firstNameField];
                const newLastName = clientData[fieldNames.lastNameField];
                const newDateOfBirth = admin.firestore.Timestamp.fromMillis(clientData[fieldNames.dateOfBirthField]);
                const batch = firebaseServices_1.db.batch();
                batch.update(firebaseServices_1.db.collection(collectionNames.clients).doc(userId), {
                    firstName: newFirstName,
                    lastName: newLastName,
                    dateOfBirth: newDateOfBirth,
                    phoneNumber: (_a = clientData[fieldNames.phoneNumberField]) !== null && _a !== void 0 ? _a : "",
                });
                const userDocData = await usersHelper_1.UsersHelper.getUserDocData(userId);
                if (typeof userDocData !== "undefined") {
                    const oldfirstName = userDocData[fieldNames.firstNameField];
                    const oldLastName = userDocData[fieldNames.lastNameField];
                    const oldDateOfBirth = userDocData[fieldNames.dateOfBirthField];
                    if (newFirstName !== oldfirstName ||
                        newLastName !== oldLastName ||
                        oldDateOfBirth !== newDateOfBirth) {
                        const updates = {
                            firstName: newFirstName,
                            lastName: newLastName,
                            dateOfBirth: newDateOfBirth,
                        };
                        batch.update(firebaseServices_1.db.collection(collectionNames.users).doc(userId), updates);
                        if (userDocData[fieldNames.isCoachField]) {
                            batch.update(firebaseServices_1.db.collection(collectionNames.coaches).doc(userId), updates);
                        }
                    }
                }
                await batch.commit();
                return res.status(200).json({ message: "Client details successfully updated" });
            }
            else {
                throw Error("User is not authorized to write this doc");
            }
        }
        else {
            throw decodedIdToken;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            return res.status(400).json({ message: error.message }).send();
        }
        console.log(strings.errorMessage);
        return res.status(400).json({ message: strings.errorMessage }).send();
    }
});
exports.clients = functions.https.onRequest(clientsApp);
//# sourceMappingURL=clientsController.js.map