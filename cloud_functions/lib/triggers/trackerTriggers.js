"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const collectionNames = require("../constants/collectionNames");
const recentUpdatesHelper_1 = require("../helpers/recentUpdatesHelper");
const trackersHelper_1 = require("../helpers/trackersHelper");
const strings = require("../constants/strings");
exports.onWriteTarget = functions.firestore.document(`${collectionNames.clients}/{clientId}/${collectionNames.trackers}/{tracker}`).onWrite(async (change, context) => {
    try {
        const coachDocAfter = change.after;
        const coachDocBefore = change.before;
        if (!coachDocBefore.exists && coachDocAfter.exists || coachDocBefore.exists && coachDocAfter.exists) {
            const trackerName = trackersHelper_1.getTrackerName(context.params.tracker);
            if (trackerName.length > 0) {
                await recentUpdatesHelper_1.setRecentUpdateForClient(context.params.clientId, `You have updated your target for ${trackerName}`);
            }
        }
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
exports.onCreateWeightRecord = functions.firestore.document(`${collectionNames.clients}/{clientId}/${collectionNames.trackers}/{tracker}/${collectionNames.weightRecords}/{weightRecord}`).onCreate(async (snap, context) => {
    try {
        const trackerName = trackersHelper_1.getTrackerName(context.params.tracker);
        if (trackerName.length > 0) {
            await recentUpdatesHelper_1.setRecentUpdateForClient(context.params.clientId, `You have added a new Weight Record for ${trackerName}`);
        }
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
//# sourceMappingURL=trackerTriggers.js.map