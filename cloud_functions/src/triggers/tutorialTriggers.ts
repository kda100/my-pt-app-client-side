import * as functions from "firebase-functions";
import * as collectionNames from "../constants/collectionNames";
import {RecentUpdatesHelper} from "../helpers/recentUpdatesHelper";
import {FirebaseMessagesHelper} from "../helpers/firebaseMessagesHelper";
import {coachesBucket, db} from "../services/firebaseServices";
import {firestore} from "firebase-admin";
import * as strings from "../constants/strings";

const exerciseTutorialDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.exerciseTutorials}/{exerciseTutorialId}`;

const posingTutorialDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.posingTutorials}/{posingTutorialId}`;

exports.onCreateExerciseTutorial = functions.firestore.document(exerciseTutorialDocRefString).onCreate(async (snap, context) => {
    try {
        const batch = db.batch();
        const coachId: string = context.params.coachId;
        const clientsMessage = "Your coach has uploaded a new Exercise Tutorial";
        RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, clientsMessage, batch);
        RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have uploaded a new Exercise Tutorial", batch);
        await batch.commit();
        await FirebaseMessagesHelper.sendMessageToCoachClients(coachId, "New Exercise Tutorial Uploaded", clientsMessage);
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});

exports.onCreatePosingTutorial = functions.firestore.document(posingTutorialDocRefString).onCreate(async (snap, context) => {
    try {
        const batch: firestore.WriteBatch = db.batch();
        const coachId: string = context.params.coachId;
        const clientsMessage = "Your coach has uploaded a new Posing Tutorial";
        RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, clientsMessage, batch);
        RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have uploaded a new Exercise Tutorial", batch);
        await batch.commit();
        await FirebaseMessagesHelper.sendMessageToCoachClients(context.params.coachId, "New Posing Tutorial Uploaded", "Your coach has uploaded a new posing tutorial");
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});

exports.onDeleteExerciseTutorial = functions.firestore.document(exerciseTutorialDocRefString).onDelete(async (snap, context) => {
    try {
        await RecentUpdatesHelper.setRecentUpdateForCoach(context.params.coachId, "You have removed Exercise Tutorial");
        await coachesBucket.deleteFiles({prefix: `${context.params.coachId}/exerciseTutorials/${snap.ref.id}`});
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});

exports.onDeletePosingTutorial = functions.firestore.document(posingTutorialDocRefString).onDelete(async (snap, context) => {
    try {
        await RecentUpdatesHelper.setRecentUpdateForCoach(context.params.coachId, "You have removed Posing Tutorial");
        await coachesBucket.deleteFiles({prefix: `${context.params.coachId}/posingTutorials/${snap.ref.id}`});
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});
