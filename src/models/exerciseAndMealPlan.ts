export enum ExerciseAndMealPlan {
    ExercisePlan = "exercisePlan",
    MealPlan = "mealPlan",
}

export function decode(exerciseAndMealPlan: string): ExerciseAndMealPlan | undefined {
    if (Object.values(exerciseAndMealPlan).some((value: string) => value === exerciseAndMealPlan)) {
        return exerciseAndMealPlan as ExerciseAndMealPlan;
    }
    return undefined;
}

export function encode(exerciseAndMealPlan: ExerciseAndMealPlan): string | undefined {
    return exerciseAndMealPlan as string;
}
