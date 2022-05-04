"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = exports.ExerciseAndMealPlan = void 0;
var ExerciseAndMealPlan;
(function (ExerciseAndMealPlan) {
    ExerciseAndMealPlan["ExercisePlan"] = "exercisePlan";
    ExerciseAndMealPlan["MealPlan"] = "mealPlan";
})(ExerciseAndMealPlan = exports.ExerciseAndMealPlan || (exports.ExerciseAndMealPlan = {}));
function decode(exerciseAndMealPlan) {
    if (Object.values(exerciseAndMealPlan).some((value) => value === exerciseAndMealPlan)) {
        return exerciseAndMealPlan;
    }
    return undefined;
}
exports.decode = decode;
function encode(exerciseAndMealPlan) {
    return exerciseAndMealPlan;
}
exports.encode = encode;
//# sourceMappingURL=exerciseAndMealPlan.js.map