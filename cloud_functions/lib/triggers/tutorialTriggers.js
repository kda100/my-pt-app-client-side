"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const collectionNames = require("../constants/collectionNames");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
const firebaseMessagesHelper_1 = require("../helpers/firebaseMessagesHelper");
const firebaseServices_1 = require("../services/firebaseServices");
const strings = require("../constants/strings");
const exerciseTutorialDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.exerciseTutorials}/{exerciseTutorialId}`;
const posingTutorialDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.posingTutorials}/{posingTutorialId}`;
exports.onCreateExerciseTutorial = functions.firestore.document(exerciseTutorialDocRefString).onCreate(async (snap, context) => {
    try {
        const batch = firebaseServices_1.db.batch();
        const coachId = context.params.coachId;
        const clientsMessage = "Your coach has uploaded a new Exercise Tutorial";
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, clientsMessage, batch);
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have uploaded a new Exercise Tutorial", batch);
        await batch.commit();
        await firebaseMessagesHelper_1.FirebaseMessagesHelper.sendMessageToCoachClients(coachId, "New Exercise Tutorial Uploaded", clientsMessage);
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            console.log(strings.errorMessage);
        }
    }
});
exports.onCreatePosingTutorial = functions.firestore.document(posingTutorialDocRefString).onCreate(async (snap, context) => {
    try {
        const batch = firebaseServices_1.db.batch();
        const coachId = context.params.coachId;
        const clientsMessage = "Your coach has uploaded a new Posing Tutorial";
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachClientsUsingBatch(coachId, clientsMessage, batch);
        recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, "You have uploaded a new Exercise Tutorial", batch);
        await batch.commit();
        await firebaseMessagesHelper_1.FirebaseMessagesHelper.sendMessageToCoachClients(context.params.coachId, "New Posing Tutorial Uploaded", "Your coach has uploaded a new posing tutorial");
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            console.log(strings.errorMessage);
        }
    }
});
exports.onDeleteExerciseTutorial = functions.firestore.document(exerciseTutorialDocRefString).onDelete(async (snap, context) => {
    try {
        await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(context.params.coachId, "You have removed Exercise Tutorial");
        await firebaseServices_1.coachesBucket.deleteFiles({ prefix: `${context.params.coachId}/exerciseTutorials/${snap.ref.id}` });
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            console.log(strings.errorMessage);
        }
    }
});
exports.onDeletePosingTutorial = functions.firestore.document(posingTutorialDocRefString).onDelete(async (snap, context) => {
    try {
        await recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoach(context.params.coachId, "You have removed Posing Tutorial");
        await firebaseServices_1.coachesBucket.deleteFiles({ prefix: `${context.params.coachId}/posingTutorials/${snap.ref.id}` });
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            console.log(strings.errorMessage);
        }
    }
});
//# sourceMappingURL=tutorialTriggers.js.map