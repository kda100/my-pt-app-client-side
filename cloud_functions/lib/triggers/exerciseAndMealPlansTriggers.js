"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const fieldNames = require("../constants/fieldNames");
const collectionNames = require("../constants/collectionNames");
const firebaseServices_1 = require("../services/firebaseServices");
const exerciseAndMealPlan_1 = require("../models/exerciseAndMealPlan");
const strings = require("../constants/strings");
const firebaseMessagesHelper_1 = require("../helpers/firebaseMessagesHelper");
const timestampHelper_1 = require("../helpers/timestampHelper");
const exerciseAndMealPlanHelper_1 = require("../helpers/exerciseAndMealPlanHelper");
const clientsHelper_1 = require("../helpers/clientsHelper");
const exerciseAndMealPlanUpdateType_1 = require("../models/exerciseAndMealPlanUpdateType");
const firebase_admin_1 = require("firebase-admin");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
const mealDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.mealPlans}/{clientId}/${collectionNames.dayMealPlans}/{dayMealPlanId}`;
const exerciseDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.exercisePlans}/{clientId}/${collectionNames.dayExercisePlans}/{dayExercisePlanId}`;
async function onWritePlan(exerciseAndMealPlan, snap, context) {
    const coachId = context.params.coachId;
    const clientId = context.params.clientId;
    try {
        if ((!snap.before.exists && snap.after.exists) || (snap.before.exists && snap.after.exists)) {
            const afterDocData = snap.after.data();
            if (typeof afterDocData !== "undefined") {
                if (!snap.before.exists && snap.after.exists) {
                    await onExerciseOrMealPlanAdded(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId);
                    // updateType = UpdateType.ADDED;
                }
                else if (snap.before.exists && snap.after.exists) {
                    const beforeDocData = snap.before.data();
                    if (typeof beforeDocData !== "undefined") {
                        const mealAndExercisePlanIndex = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getCompletedExerciseOrMealIndex(beforeDocData[fieldNames.completedArrField], afterDocData[fieldNames.completedArrField]);
                        if (mealAndExercisePlanIndex !== -1) {
                            await onExerciseOrMealCompleted(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId, mealAndExercisePlanIndex);
                            // updateType = UpdateType.COMPLETED;
                        }
                        else {
                            await onModifiedExerciseOrMealPlan(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId);
                            // updateType = UpdateType.MODIFIED;
                        }
                    }
                }
            }
        }
        else {
            const beforeDocData = snap.before.data();
            if (typeof beforeDocData !== "undefined") {
                await onRemovedExcercisePlan(snap.after.id, exerciseAndMealPlan, beforeDocData, coachId, clientId);
                // updateType = UpdateType.REMOVED;
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        }
        else {
            functions.logger.log(strings.errorMessage);
        }
    }
}
async function onExerciseOrMealPlanAdded(docId, exerciseAndMealPlan, afterDocData, coachId, clientId) {
    const batch = firebaseServices_1.db.batch();
    const clientFullName = await clientsHelper_1.ClientsHelper.getClientFullName(clientId);
    const planName = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getExerciseOrMealPlanName(exerciseAndMealPlan);
    const dateString = timestampHelper_1.TimeStampHelper.convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField]);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, `Your coach has added a new ${planName} for ${dateString}.`, batch);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, `You have added a new ${planName} for ${clientFullName}.`, batch);
    await firebaseMessagesHelper_1.FirebaseMessagesHelper.sendMessageToClient(clientId, `New ${planName} Added`, `Your coach has added a new ${planName} for ${dateString}.`);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, exerciseAndMealPlanUpdateType_1.UpdateType.ADDED, afterDocData[fieldNames.dateField], docId);
    await batch.commit();
    // updateType = UpdateType.ADDED;
}
async function onExerciseOrMealCompleted(docId, exerciseAndMealPlan, afterDocData, coachId, clientId, mealOrExerciseIndex) {
    const batch = firebaseServices_1.db.batch();
    const clientFullName = await clientsHelper_1.ClientsHelper.getClientFullName(clientId);
    const planName = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getExerciseOrMealPlanName(exerciseAndMealPlan);
    const exercisesOrMealsFieldName = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getExerciseOrMealFieldName(exerciseAndMealPlan);
    const singularExerciseOrMeal = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getSingularExerciseOrMeal(exerciseAndMealPlan);
    await updateClientPerformance(exerciseAndMealPlan, coachId, clientId);
    const timeString = timestampHelper_1.TimeStampHelper.convertTimestampToHHMM(afterDocData[exercisesOrMealsFieldName][mealOrExerciseIndex][fieldNames.timeField]);
    const coachesMessage = `${clientFullName} has completed ${singularExerciseOrMeal} scheduled for ${timeString}.`;
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, coachesMessage, batch);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, `You have completed ${singularExerciseOrMeal} scheduled for ${timeString}.`, batch);
    await batch.commit();
    await firebaseMessagesHelper_1.FirebaseMessagesHelper.sendMessageToCoach(coachId, `${planName} Completed.`, coachesMessage);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, exerciseAndMealPlanUpdateType_1.UpdateType.COMPLETED, afterDocData[fieldNames.dateField], docId);
    // updateType = UpdateType.COMPLETED;
}
async function onModifiedExerciseOrMealPlan(docId, exerciseAndMealPlan, afterDocData, coachId, clientId) {
    const batch = firebaseServices_1.db.batch();
    const clientFullName = await clientsHelper_1.ClientsHelper.getClientFullName(clientId);
    const planName = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getExerciseOrMealPlanName(exerciseAndMealPlan);
    const dateString = timestampHelper_1.TimeStampHelper.convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField]);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, `Your coach has updated your ${planName} for ${dateString}.`, batch);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, `You have updated the ${planName} for ${clientFullName} on ${dateString}.`, batch);
    await firebaseMessagesHelper_1.FirebaseMessagesHelper.sendMessageToClient(clientId, `${planName} Update`, `Your coach has updated your ${planName} for ${timestampHelper_1.TimeStampHelper.convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField])}.`);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, exerciseAndMealPlanUpdateType_1.UpdateType.MODIFIED, afterDocData[fieldNames.dateField], docId);
    await batch.commit();
}
async function onRemovedExcercisePlan(docId, exerciseAndMealPlan, beforeDocData, coachId, clientId) {
    const batch = firebaseServices_1.db.batch();
    const clientFullName = await clientsHelper_1.ClientsHelper.getClientFullName(clientId);
    const planName = exerciseAndMealPlanHelper_1.ExerciseAndMealPlanHelper.getExerciseOrMealPlanName(exerciseAndMealPlan);
    const dateString = timestampHelper_1.TimeStampHelper.convertTimestampToDayMonthYear(beforeDocData[fieldNames.dateField]);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForCoachUsingBatch(coachId, `You have removed a ${planName} for ${clientFullName} on ${dateString}.`, batch);
    recentUpdatesHelper_1.RecentUpdatesHelper.setRecentUpdateForClientUsingBatch(clientId, `Your coach has removed a ${planName} for ${dateString}.`, batch);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, exerciseAndMealPlanUpdateType_1.UpdateType.REMOVED, beforeDocData[fieldNames.dateField], docId);
    // updateType = UpdateType.REMOVED;
    await batch.commit();
}
async function updateRecentChange(exerciseAndMealPlan, coachId, clientId, updateType, date, docId) {
    let docRef = undefined;
    if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
        docRef = firebaseServices_1.db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.exercisePlans).doc(clientId);
    }
    else if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.MealPlan) {
        docRef = firebaseServices_1.db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.mealPlans).doc(clientId);
    }
    if (typeof docRef !== "undefined") {
        await docRef.set({
            docId: docId,
            occurredAt: firebase_admin_1.firestore.Timestamp.now(),
            docDate: date,
            updateType: updateType,
        });
    }
}
async function updateClientPerformance(exerciseAndMealPlan, coachId, clientId) {
    let fieldName;
    if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
        fieldName = fieldNames.exercisesCompletedField;
    }
    else if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.MealPlan) {
        fieldName = fieldNames.mealsCompletedField;
    }
    const clientPerformanceDocString = `${collectionNames.clientManagement}/${coachId}/${collectionNames.clientPerformance}/${clientId}`;
    const clientPerformanceDocData = (await firebaseServices_1.db.doc(clientPerformanceDocString).get()).data();
    if (typeof clientPerformanceDocData !== "undefined") {
        if (typeof fieldName !== "undefined") {
            const currentExercisesOrMealsCompleted = clientPerformanceDocData[fieldName];
            if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
                await firebaseServices_1.db.doc(clientPerformanceDocString).update({
                    exercisesCompleted: isNaN(currentExercisesOrMealsCompleted) ? 1 : currentExercisesOrMealsCompleted + 1,
                });
            }
            else if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.MealPlan) {
                await firebaseServices_1.db.doc(clientPerformanceDocString).update({
                    mealsCompleted: isNaN(currentExercisesOrMealsCompleted) ? 1 : currentExercisesOrMealsCompleted + 1,
                });
            }
        }
    }
}
exports.onWriteMealPlan = functions.firestore.document(mealDocRefString).onWrite(async (snap, context) => {
    await onWritePlan(exerciseAndMealPlan_1.ExerciseAndMealPlan.MealPlan, snap, context);
});
exports.onWriteExercisePlan = functions.firestore.document(exerciseDocRefString).onWrite(async (snap, context) => {
    await onWritePlan(exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan, snap, context);
});
//# sourceMappingURL=exerciseAndMealPlansTriggers.js.map