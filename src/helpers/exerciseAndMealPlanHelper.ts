import {ExerciseAndMealPlan} from "../models/exerciseAndMealPlan";
import * as fieldNames from "../constants/fieldNames";

export function getExerciseOrMealPlanName(exerciseAndMealPlan: ExerciseAndMealPlan): string {
    if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
        return "Exercise Plan";
    } else {
        return "Meal Plan";
    }
}

export function getSingularExerciseOrMeal(exerciseAndMealPlan: ExerciseAndMealPlan): string {
    if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
        return "the exercise";
    } else {
        return "the meal";
    }
}

export function getExerciseOrMealFieldName(exerciseAndMealPlan: ExerciseAndMealPlan): string {
    if (exerciseAndMealPlan === ExerciseAndMealPlan.ExercisePlan) {
        return fieldNames.exercisesField;
    } else {
        return fieldNames.mealsField;
    }
}

export function getCompletedExerciseOrMealIndex(beforeCompletedArr: boolean[], afterCompletedArr: boolean[]): number {
    if (beforeCompletedArr.length === afterCompletedArr.length) {
        for (let i = 0; i < afterCompletedArr.length; i++) {
            if (!beforeCompletedArr[i] && afterCompletedArr[i]) {
                return i;
            }
        }
    }
    return -1;
}
