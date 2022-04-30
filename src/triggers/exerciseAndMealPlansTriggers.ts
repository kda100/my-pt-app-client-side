import * as functions from "firebase-functions";
import * as fieldNames from "../constants/fieldNames";
import * as collectionNames from "../constants/collectionNames";
import {db} from "../services/firebaseServices";
import {ExerciseAndMealPlan} from "../models/exerciseAndMealPlan";
import * as strings from "../constants/strings";
import {sendMessageToClient, sendMessageToCoach} from "../helpers/firebaseMessagesHelper";
import {convertTimestampToDayMonthYear, convertTimestampToHHMM} from "../helpers/timestampHelper";
import {getExerciseOrMealPlanName, getSingularExerciseOrMeal, getCompletedExerciseOrMealIndex, getExerciseOrMealFieldName} from "../helpers/exerciseAndMealPlanHelper";
import {getClientFullName} from "../helpers/clientsHelper";
import {UpdateType} from "../models/exerciseAndMealPlanUpdateType";
import {firestore} from "firebase-admin";
import {setRecentUpdateForClientUsingBatch, setRecentUpdateForCoachUsingBatch} from "../helpers/recentUpdatesHelper";

const mealDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.mealPlans}/{clientId}/${collectionNames.dayMealPlans}/{dayMealPlanId}`;

const exerciseDocRefString = `${collectionNames.clientManagement}/{coachId}/${collectionNames.exercisePlans}/{clientId}/${collectionNames.dayExercisePlans}/{dayExercisePlanId}`;

async function onWritePlan(exerciseAndMealPlan: ExerciseAndMealPlan, snap: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) {
    const coachId: string = context.params.coachId;
    const clientId: string = context.params.clientId;

    try {
        if ((!snap.before.exists && snap.after.exists) || (snap.before.exists && snap.after.exists)) {
            const afterDocData: FirebaseFirestore.DocumentData | undefined = snap.after.data();
            if (typeof afterDocData !== "undefined") {
                if (!snap.before.exists && snap.after.exists) {
                    await onExerciseOrMealPlanAdded(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId);
                    // updateType = UpdateType.ADDED;
                } else if (snap.before.exists && snap.after.exists) {
                    const beforeDocData: FirebaseFirestore.DocumentData | undefined = snap.before.data();
                    if (typeof beforeDocData !== "undefined") {
                        const mealAndExercisePlanIndex = getCompletedExerciseOrMealIndex(beforeDocData[fieldNames.completedArrField], afterDocData[fieldNames.completedArrField]);
                        if (mealAndExercisePlanIndex !== -1) {
                            await onExerciseOrMealCompleted(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId, mealAndExercisePlanIndex);
                            // updateType = UpdateType.COMPLETED;
                        } else {
                            await onModifiedExerciseOrMealPlan(snap.after.id, exerciseAndMealPlan, afterDocData, coachId, clientId);
                            // updateType = UpdateType.MODIFIED;
                        }
                    }
                }
            }
        } else {
            const beforeDocData: FirebaseFirestore.DocumentData | undefined = snap.before.data();
            if (typeof beforeDocData !== "undefined") {
                await onRemovedExcercisePlan(snap.after.id, exerciseAndMealPlan, beforeDocData, coachId, clientId);
                // updateType = UpdateType.REMOVED;
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            functions.logger.log(strings.errorMessage);
        }
    }
}

async function onExerciseOrMealPlanAdded(docId: string, exerciseAndMealPlan: ExerciseAndMealPlan, afterDocData: FirebaseFirestore.DocumentData, coachId: string, clientId: string,) {
    const batch: firestore.WriteBatch = db.batch();
    const clientFullName: string = await getClientFullName(clientId);
    const planName: string = getExerciseOrMealPlanName(exerciseAndMealPlan);
    const dateString: string = convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField]);

    setRecentUpdateForClientUsingBatch(clientId, `Your coach has added a new ${planName} for ${dateString}.`, batch);
    setRecentUpdateForCoachUsingBatch(coachId, `You have added a new ${planName} for ${clientFullName}.`, batch);
    await sendMessageToClient(clientId, `New ${planName} Added`, `Your coach has added a new ${planName} for ${dateString}.`);

    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, UpdateType.ADDED, afterDocData[fieldNames.dateField], docId);
    await batch.commit();
    // updateType = UpdateType.ADDED;
}

async function onExerciseOrMealCompleted(docId: string, exerciseAndMealPlan: ExerciseAndMealPlan, afterDocData: FirebaseFirestore.DocumentData, coachId: string, clientId: string, mealOrExerciseIndex: number,) {
    const batch: firestore.WriteBatch = db.batch();
    const clientFullName: string = await getClientFullName(clientId);
    const planName: string = getExerciseOrMealPlanName(exerciseAndMealPlan);
    const exercisesOrMealsFieldName: string = getExerciseOrMealFieldName(exerciseAndMealPlan);
    const singularExerciseOrMeal: string = getSingularExerciseOrMeal(exerciseAndMealPlan);

    await updateClientPerformance(exerciseAndMealPlan, coachId, clientId);
    const timeString: string = convertTimestampToHHMM(afterDocData[exercisesOrMealsFieldName][mealOrExerciseIndex][fieldNames.timeField]);
    const coachesMessage = `${clientFullName} has completed ${singularExerciseOrMeal} scheduled for ${timeString}.`;
    setRecentUpdateForCoachUsingBatch(coachId, coachesMessage, batch);
    setRecentUpdateForClientUsingBatch(clientId, `You have completed ${singularExerciseOrMeal} scheduled for ${timeString}.`, batch);

    await batch.commit();
    await sendMessageToCoach(coachId, `${planName} Completed.`, coachesMessage);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, UpdateType.COMPLETED, afterDocData[fieldNames.dateField], docId);
    // updateType = UpdateType.COMPLETED;
}

async function onModifiedExerciseOrMealPlan(docId: string, exerciseAndMealPlan: ExerciseAndMealPlan, afterDocData: FirebaseFirestore.DocumentData, coachId: string, clientId: string,) {
    const batch: firestore.WriteBatch = db.batch();
    const clientFullName: string = await getClientFullName(clientId);
    const planName: string = getExerciseOrMealPlanName(exerciseAndMealPlan);
    const dateString: string = convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField]);


    setRecentUpdateForClientUsingBatch(clientId, `Your coach has updated your ${planName} for ${dateString}.`, batch);
    setRecentUpdateForCoachUsingBatch(coachId, `You have updated the ${planName} for ${clientFullName} on ${dateString}.`, batch);
    await sendMessageToClient(clientId, `${planName} Update`, `Your coach has updated your ${planName} for ${convertTimestampToDayMonthYear(afterDocData[fieldNames.dateField])}.`);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, UpdateType.MODIFIED, afterDocData[fieldNames.dateField], docId);

    await batch.commit();
}

async function onRemovedExcercisePlan(docId: string, exerciseAndMealPlan: ExerciseAndMealPlan, beforeDocData: FirebaseFirestore.DocumentData, coachId: string, clientId: string) {
    const batch: firestore.WriteBatch = db.batch();
    const clientFullName: string = await getClientFullName(clientId);
    const planName: string = getExerciseOrMealPlanName(exerciseAndMealPlan);

    const dateString: string = convertTimestampToDayMonthYear(beforeDocData[fieldNames.dateField]);
    setRecentUpdateForCoachUsingBatch(coachId, `You have removed a ${planName} for ${clientFullName} on ${dateString}.`, batch);
    setRecentUpdateForClientUsingBatch(clientId, `Your coach has removed a ${planName} for ${dateString}.`, batch);
    await updateRecentChange(exerciseAndMealPlan, coachId, clientId, UpdateType.REMOVED, beforeDocData[fieldNames.dateField], docId);
    // updateType = UpdateType.REMOVED;

    await batch.commit();
}

async function updateRecentChange(exerciseAndMealPlan: ExerciseAndMealPlan, coachId: string, clientId: string, updateType: UpdateType, date: firestore.Timestamp, docId: string): Promise<void> {
    let docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | undefined = undefined;
    if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
        docRef = db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.exercisePlans).doc(clientId);
    } else if (exerciseAndMealPlan === ExerciseAndMealPlan.MealPlan) {
        docRef = db.collection(collectionNames.clientManagement).doc(coachId).collection(collectionNames.mealPlans).doc(clientId);
    }
    if (typeof docRef !== "undefined") {
        await docRef.set({
            docId: docId,
            occurredAt: firestore.Timestamp.now(),
            docDate: date,
            updateType: updateType,
        });
    }
}

async function updateClientPerformance(exerciseAndMealPlan: ExerciseAndMealPlan, coachId: string, clientId: string): Promise<void> {
    let fieldName: string | undefined;
    if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
        fieldName = fieldNames.exercisesCompletedField;
    } else if (exerciseAndMealPlan === ExerciseAndMealPlan.MealPlan) {
        fieldName = fieldNames.mealsCompletedField;
    }
    const clientPerformanceDocString = `${collectionNames.clientManagement}/${coachId}/${collectionNames.clientPerformance}/${clientId}`;
    const clientPerformanceDocData: FirebaseFirestore.DocumentData | undefined = (await db.doc(clientPerformanceDocString).get()).data();
    if (typeof clientPerformanceDocData !== "undefined") {
        if (typeof fieldName !== "undefined") {
            const currentExercisesOrMealsCompleted: number = clientPerformanceDocData[fieldName];
            if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
                await db.doc(clientPerformanceDocString).update({
                    exercisesCompleted: isNaN(currentExercisesOrMealsCompleted) ? 1 : currentExercisesOrMealsCompleted + 1,
                });
            } else if (exerciseAndMealPlan === ExerciseAndMealPlan.MealPlan) {
                await db.doc(clientPerformanceDocString).update({
                    mealsCompleted: isNaN(currentExercisesOrMealsCompleted) ? 1 : currentExercisesOrMealsCompleted + 1,
                });
            }
        }
    }
}

exports.onWriteMealPlan = functions.firestore.document(mealDocRefString).onWrite(async (snap, context) => {
    await onWritePlan(ExerciseAndMealPlan.MealPlan, snap, context);
});

exports.onWriteExercisePlan = functions.firestore.document(exerciseDocRefString).onWrite(async (snap, context) => {
    await onWritePlan(ExerciseAndMealPlan.ExercisePlan, snap, context);
});
