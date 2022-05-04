import * as functions from "firebase-functions";
import * as collectionNames from "../constants/collectionNames";
import {RecentUpdatesHelper} from "../helpers/recentUpdatesHelper";
import {TrackersHelper} from "../helpers/trackersHelper";
import * as strings from "../constants/strings";

exports.onWriteTarget = functions.firestore.document(`${collectionNames.clients}/{clientId}/${collectionNames.trackers}/{tracker}`).onWrite(async (change, context) => {
    try {
        const coachDocAfter: functions.firestore.DocumentSnapshot = change.after;
        const coachDocBefore: functions.firestore.DocumentSnapshot = change.before;
        if (!coachDocBefore.exists && coachDocAfter.exists || coachDocBefore.exists && coachDocAfter.exists) {
            const trackerName: string = TrackersHelper.getTrackerName(context.params.tracker);
            if (trackerName.length > 0) {
                await RecentUpdatesHelper.setRecentUpdateForClient(context.params.clientId, `You have updated your target for ${trackerName}`);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});

exports.onCreateWeightRecord = functions.firestore.document(`${collectionNames.clients}/{clientId}/${collectionNames.trackers}/{tracker}/${collectionNames.weightRecords}/{weightRecord}`).onCreate(async (snap, context) => {
    try {
        const trackerName: string = TrackersHelper.getTrackerName(context.params.tracker);
        if (trackerName.length > 0) {
            await RecentUpdatesHelper.setRecentUpdateForClient(context.params.clientId, `You have added a new Weight Record for ${trackerName}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            functions.logger.log(error.message);
        } else {
            console.log(strings.errorMessage);
        }
    }
});
