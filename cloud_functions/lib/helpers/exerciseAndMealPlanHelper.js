"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseAndMealPlanHelper = void 0;
const exerciseAndMealPlan_1 = require("../models/exerciseAndMealPlan");
const fieldNames = require("../constants/fieldNames");
class ExerciseAndMealPlanHelper {
    static getExerciseOrMealPlanName(exerciseAndMealPlan) {
        if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
            return "Exercise Plan";
        }
        else {
            return "Meal Plan";
        }
    }
    static getSingularExerciseOrMeal(exerciseAndMealPlan) {
        if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
            return "the exercise";
        }
        else {
            return "the meal";
        }
    }
    static getExerciseOrMealFieldName(exerciseAndMealPlan) {
        if (exerciseAndMealPlan === exerciseAndMealPlan_1.ExerciseAndMealPlan.ExercisePlan) {
            return fieldNames.exercisesField;
        }
        else {
            return fieldNames.mealsField;
        }
    }
    static getCompletedExerciseOrMealIndex(beforeCompletedArr, afterCompletedArr) {
        if (beforeCompletedArr.length === afterCompletedArr.length) {
            for (let i = 0; i < afterCompletedArr.length; i++) {
                if (!beforeCompletedArr[i] && afterCompletedArr[i]) {
                    return i;
                }
            }
        }
        return -1;
    }
}
exports.ExerciseAndMealPlanHelper = ExerciseAndMealPlanHelper;
//# sourceMappingURL=exerciseAndMealPlanHelper.js.map