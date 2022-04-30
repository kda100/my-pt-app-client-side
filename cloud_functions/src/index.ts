import * as admin from "firebase-admin";

admin.initializeApp();

module.exports = {
    ...require("./controllers/clientsAuthController"),
    ...require("./controllers/coachesAuthController"),
    ...require("./controllers/clientsController"),
    ...require("./controllers/coachesController"),
    ...require("./triggers/clientsTriggers"),
    ...require("./triggers/coachesTriggers"),
    ...require("./triggers/usersTriggers"),
    ...require("./triggers/coachChatsTriggers"),
    ...require("./triggers/exerciseAndMealPlansTriggers"),
    ...require("./triggers/tutorialTriggers"),
    ...require("./triggers/myClientsTrigger"),
    ...require("./triggers/trackerTriggers"),
    ...require("./triggers/clientManagementTriggers"),
};
