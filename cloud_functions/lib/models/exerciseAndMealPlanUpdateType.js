"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.UpdateType = void 0;
var UpdateType;
(function (UpdateType) {
    UpdateType["ADDED"] = "added";
    UpdateType["MODIFIED"] = "modified";
    UpdateType["REMOVED"] = "removed";
    UpdateType["COMPLETED"] = "completed";
    UpdateType["ERROR"] = "error";
})(UpdateType = exports.UpdateType || (exports.UpdateType = {}));
function encode(updateType) {
    return updateType;
}
exports.encode = encode;
//# sourceMappingURL=exerciseAndMealPlanUpdateType.js.map