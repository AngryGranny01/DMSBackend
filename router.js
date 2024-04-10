const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/logProject.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");

var router = require("express").Router();

//-------------------------------------------- Login --------------------------------------------------------------//

//-------------------------------------------- Create --------------------------------------------------------------//

//-------------------------------------------- Retrieve All--------------------------------------------------------------//
router.post("/projects", projectController.create);
router.get("/projects", projectController.findAll);
router.get("/projects/:userID", projectController.findUserProjects);

router.put("/projects", projectController.update);
router.delete("/projects", projectController.delete);


router.get("/logs/project", logController.findProjectLogs);
router.post("/project-logs", logController.create);

//get Admin Password, Manager Password and ManagerID
router.get("/projectAdminAndManager/passwords/:id", projectManagerController.findManagerAndAdminPassword);

//-------------------------------------------- Update --------------------------------------------------------------//
router.put("/projectManager", projectManagerController.update)

//-------------------------------------------- Delete --------------------------------------------------------------//
router.delete("/projectManager", projectManagerController.delete);

//-------------------------------------------- Check If Exists --------------------------------------------------------------//


//-------------------------------------------- USER --------------------------------------------------------------//
router.post("/users", userController.create);
router.get("/users/checkEmailExist", userController.checkIfEmailExist);
router.get("/users/checkUsernameExist", userController.checkIfUsernameExist);
router.get("/users/login", userController.checkLogin);
router.get("/user/:userID", userController.findOne)

router.delete("/users/:userID", userController.delete);
router.get("/users/findSalt", userController.findSalt);
router.get("/users/:senderUserID", userController.getAllUsers);
router.put("/users", userController.update);
router.put("/verifyToken", userController.verifyToken);


//-------------------------------------------- LOG USER --------------------------------------------------------------//
router.get("/user-logs/lastLogins/:userID", logUserController.lastLoginDates);
router.post("/user-logs", logUserController.create);
router.get("/user-logs/:userID", logUserController.findUserLogs);



module.exports = router