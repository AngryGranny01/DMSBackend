const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/log.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");

var router = require("express").Router();

//-------------------------------------------- Login --------------------------------------------------------------//
router.get("/user/login", userController.checkLogin);

//-------------------------------------------- Create --------------------------------------------------------------//
router.post("/projects", projectController.create);
router.post("/users", userController.create);
router.post("/user-logs", logUserController.create);
router.post("/project-logs", logController.create);

//-------------------------------------------- Retrieve All--------------------------------------------------------------//
router.get("/users", userController.findAllWithLastLogin);
router.get("/projects", projectController.findAll);

//-------------------------------------------- Retrieve All By ID --------------------------------------------------------------//
router.get("/projects/user", projectController.findAllUserProjects);
router.get("/logs/user", logController.findUserLogs);
router.get("/logs/project", logController.findProjectLogs);

//-------------------------------------------- Find One By ID --------------------------------------------------------------//
router.get("/projects/:id", projectController.findOneProject);
router.get("/users/:id", userController.findOne);
router.get("/projectManager/:id", projectManagerController.findManagerID);


//-------------------------------------------- Update --------------------------------------------------------------//
router.put("/users", userController.update);
router.put("/projects", projectController.update);
router.put("/projectManager", projectManagerController.update)

//-------------------------------------------- Delete --------------------------------------------------------------//
router.delete("/users", userController.delete);
router.delete("/projects", projectController.delete);
router.delete("/projectManager", projectManagerController.delete);

//-------------------------------------------- Check If Exists --------------------------------------------------------------//
router.get("/user/exist/email", userController.checkIfEmailExist);
router.get("/user/exist/username", userController.checkIfUsernamExist);

module.exports = router