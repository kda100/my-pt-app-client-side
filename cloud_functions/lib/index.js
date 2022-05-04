"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
admin.initializeApp();
exports.clientsAuthController = require("./controllers/clientsAuthController");
exports.coachesAuthController = require("./controllers/coachesAuthController");
exports.clientsController = require("./controllers/clientsController");
exports.coachesController = require("./controllers/coachesController");
exports.clientsTriggers = require("./triggers/clientsTriggers");
exports.coachesTriggers = require("./triggers/coachesTriggers");
exports.usersTriggers = require("./triggers/usersTriggers");
exports.coachChatTriggers = require("./triggers/coachChatTriggers");
exports.exerciseAndMealPlansTriggers = require("./triggers/exerciseAndMealPlansTriggers");
exports.tutorialTriggers = require("./triggers/tutorialTriggers");
exports.myClientsTrigger = require("./triggers/myClientsTrigger");
exports.trackerTriggers = require("./triggers/trackersTriggers");
exports.clientManagementTriggers = require("./triggers/clientManagementTriggers");
//# sourceMappingURL=index.js.map