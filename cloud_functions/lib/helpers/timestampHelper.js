"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeStampHelper = void 0;
class TimeStampHelper {
    static convertTimestampToDayMonthYear(timestamp) {
        const date = timestamp.toDate();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();
        return (day < 10 ? `0${day}` : day) + "/" + (month < 10 ? `0${month}` : month) + "/" + year;
    }
    static convertTimestampToHHMM(timestamp) {
        const date = timestamp.toDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return (hours < 10 ? `0${hours}` : hours) + ":" + (minutes < 10 ? `0${minutes}` : minutes);
    }
}
exports.TimeStampHelper = TimeStampHelper;
//# sourceMappingURL=timestampHelper.js.map