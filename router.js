const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/log.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");

var router = require("express").Router();

//-------------------------------------------- Login --------------------------------------------------------------//


//-------------------------------------------- Create --------------------------------------------------------------//
router.post("/projects", projectController.create);
router.post("/user-logs", logUserController.create);
router.post("/project-logs", logController.create);

//-------------------------------------------- Retrieve All--------------------------------------------------------------//
router.get("/projects", projectController.findAll);

//-------------------------------------------- Retrieve All By ID --------------------------------------------------------------//
router.get("/projects/user", projectController.findAllUserProjects);
router.get("/logs/user", logController.findUserLogs);
router.get("/logs/project", logController.findProjectLogs);

//-------------------------------------------- Find One By ID --------------------------------------------------------------//
router.get("/projects/:id", projectController.findOneProject);

//get Admin Password, Manager Password and ManagerID
router.get("/projectAdminAndManager/passwords/:id", projectManagerController.findManagerAndAdminPassword);

//-------------------------------------------- Update --------------------------------------------------------------//
router.put("/projects", projectController.update);
router.put("/projectManager", projectManagerController.update)

//-------------------------------------------- Delete --------------------------------------------------------------//
router.delete("/projects", projectController.delete);
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
//router.get("/user-logs/lastLogin", logUserController.lastLoginDate);
router.get("/user-logs/lastLogins", logUserController.lastLoginDates);



module.exports = router