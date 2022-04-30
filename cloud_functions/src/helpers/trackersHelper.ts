import * as docNames from "../constants/documentNames";

export function getTrackerName(trackerDoc: string): string {
    if (trackerDoc === docNames.bodyWeightTrackerDoc) {
        return "Body Weight Tracker";
    } else if (trackerDoc === docNames.benchPressTrackerDoc) {
        return "Bench Press Tracker";
    } else if (trackerDoc === docNames.squatTrackerDoc) {
        return "Squat Tracker";
    } else if (trackerDoc === docNames.deadliftTrackerDoc) {
        return "Deadlift Tracker";
    }
    return "";
}
