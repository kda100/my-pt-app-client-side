import * as admin from "firebase-admin";

admin.initializeApp();

exports.clientsRoutes = require("./routes/clientRoutes");
exports.coachesRoutes = require("./routes/coachRoutes");
exports.clientsTriggers = require("./triggers/clientsTriggers");
exports.coachesTriggers = require("./triggers/coachesTriggers");
exports.usersTriggers = require("./triggers/usersTriggers");
exports.coachChatTriggers = require("./triggers/coachChatTriggers");
exports.exerciseAndMealPlansTriggers = require("./triggers/exerciseAndMealPlansTriggers");
exports.tutorialTriggers = require("./triggers/tutorialTriggers");
exports.myClientsTrigger = require("./triggers/myClientsTrigger");
exports.trackerTriggers = require("./triggers/trackersTriggers");
exports.clientManagementTriggers = require("./triggers/clientManagementTriggers");
