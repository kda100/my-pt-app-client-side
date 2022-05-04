"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackersHelper = void 0;
const docNames = require("../constants/documentNames");
class TrackersHelper {
    static getTrackerName(trackerDoc) {
        if (trackerDoc === docNames.bodyWeightTrackerDoc) {
            return "Body Weight Tracker";
        }
        else if (trackerDoc === docNames.benchPressTrackerDoc) {
            return "Bench Press Tracker";
        }
        else if (trackerDoc === docNames.squatTrackerDoc) {
            return "Squat Tracker";
        }
        else if (trackerDoc === docNames.deadliftTrackerDoc) {
            return "Deadlift Tracker";
        }
        return "";
    }
}
exports.TrackersHelper = TrackersHelper;
//# sourceMappingURL=trackersHelper.js.map