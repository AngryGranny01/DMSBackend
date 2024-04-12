const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/logProject.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");

var router = require("express").Router();

//-------------------------------------------- USER --------------------------------------------------------------//
router.post("/users", userController.create);

router.get("/users/checkEmailExist", userController.checkIfEmailExist);
router.get("/users/checkUsernameExist", userController.checkIfUsernameExist);
router.get("/users/login", userController.checkLogin);
router.get("/user/:userID", userController.findOne)
router.get("/users/findSalt", userController.findSalt);
router.get("/users/:senderUserID", userController.getAllUsers);

router.delete("/users/:userID", userController.delete);

router.put("/users", userController.update);
router.put("/verifyToken", userController.verifyToken);


//-------------------------------------------- Project--------------------------------------------------------------//
router.post("/projects", projectController.create);

router.get("/projects", projectController.findAll);
router.get("/projects/:userID", projectController.findUserProjects);

router.put("/projects", projectController.update);

router.delete("/projects", projectController.delete);

//-------------------------------------------- PROJECT MANAGER --------------------------------------------------------------//
router.put("/projectManager", projectManagerController.update)

router.get("/projectAdminAndManager/passwords/:id", projectManagerController.findManagerAndAdminPassword);

router.delete("/projectManager", projectManagerController.delete);

//-------------------------------------------- LOG USER --------------------------------------------------------------//
router.post("/user-logs", logUserController.create);

router.get("/user-logs/:userID", logUserController.findUserLogs);
router.get("/user-logs/lastLogins/:userID", logUserController.lastLoginDates);


//-------------------------------------------- LOG PROJECT --------------------------------------------------------------//
router.post("/project-logs", logController.create);

router.get("/project-logs", logController.findProjectLogs);





module.exports = router