import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as strings from "../constants/strings";
import * as fieldNames from "../constants/fieldNames";
import * as collectionNames from "../constants/collectionNames";
import {authErrorFormatter, userUpdateValidators, decodeFirebaseIdToken} from "../helpers/validationHelper";
import {validationResult} from "express-validator";
import {db} from "../services/firebaseServices";
import {getUserDocData} from "../helpers/usersHelper";
import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import {DecodedIdToken} from "firebase-admin/lib/auth/token-verifier";

const clientsApp = express();
clientsApp.use(cors({origin: true}));

clientsApp.post(`/update_client_details/:${strings.clientId}`, userUpdateValidators, async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req).formatWith(authErrorFormatter);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({error: errors.array()});
    }
    try {
        const decodedIdToken: DecodedIdToken | Error = await decodeFirebaseIdToken(req.headers.authorization);
        if (!(decodedIdToken instanceof Error)) {
            const userId = req.params[strings.clientId];
            if (userId === decodedIdToken.uid) {
                const clientData = req.body;

                const newFirstName: string = clientData[fieldNames.firstNameField];
                const newLastName: string = clientData[fieldNames.lastNameField];
                const newDateOfBirth: firestore.Timestamp = admin.firestore.Timestamp.fromMillis(clientData[fieldNames.dateOfBirthField]);

                const batch = db.batch();

                batch.update(db.collection(collectionNames.clients).doc(userId), {
                    firstName: newFirstName,
                    lastName: newLastName,
                    dateOfBirth: newDateOfBirth,
                    phoneNumber: clientData[fieldNames.phoneNumberField] ?? "",
                });

                const userDocData: firestore.DocumentData | undefined = await getUserDocData(userId);
                if (typeof userDocData !== "undefined") {
                    const oldfirstName: string = userDocData[fieldNames.firstNameField];
                    const oldLastName: string = userDocData[fieldNames.lastNameField];
                    const oldDateOfBirth: firestore.Timestamp = userDocData[fieldNames.dateOfBirthField];

                    if (newFirstName !== oldfirstName ||
                        newLastName !== oldLastName ||
                        oldDateOfBirth !== newDateOfBirth) {
                        batch.update(
                            db.collection(collectionNames.users).doc(userId), {
                            firstName: newFirstName,
                            lastName: newLastName,
                            dateOfBirth: newDateOfBirth,
                        },
                        );
                        if (userDocData[fieldNames.isCoachField]) {
                            batch.update(db.collection(collectionNames.coaches).doc(userId), {
                                firstName: newFirstName,
                                lastName: newLastName,
                                dateOfBirth: newDateOfBirth,
                            });
                        }
                    }
                }
                await batch.commit();
                return res.status(200).json({message: "Client details successfully updated"});
            } else {
                throw Error("User is not authorized to write this doc");
            }
        } else {
            throw decodedIdToken;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            return res.status(400).json({message: error.message}).send();
        }
        console.log(strings.errorMessage);
        return res.status(400).json({message: strings.errorMessage}).send();
    }
});

exports.clients = functions.https.onRequest(clientsApp);