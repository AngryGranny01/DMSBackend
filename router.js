const express = require('express');
const router = express.Router();

const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/logProject.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");
const { userValidationRules, validate } = require('./middleware/validation');

// Login route
router.post('/login', userController.login);

// User routes
router.post("/users", userValidationRules(), validate, userController.create);
router.get("/users/checkEmailExist", userController.checkIfEmailExist);
router.get("/users/checkUsernameExist", userController.checkIfUsernameExist);
router.get("/user/:userID", userController.findOne);
router.get("/users/findSalt", userController.findSalt);
router.get("/users", userController.getAllUsers);
router.delete("/users/:userID", userController.delete);
router.put("/users", userController.update);
router.put("/verifyToken", userController.verifyToken);

// Project routes
router.post("/projects", projectController.create);
router.get("/projects", projectController.findAll);
router.get("/projects/:userID", projectController.findUserProjects);
router.put("/projects", projectController.update);
router.delete("/projects", projectController.delete);

// Project Manager routes
router.put("/projectManager", projectManagerController.update);
router.get("/projectAdminAndManager/passwords/:id", projectManagerController.findManagerAndAdminPassword);
router.delete("/projectManager", projectManagerController.delete);

// Log User routes
router.post("/user-logs", logUserController.create);
router.get("/user-logs/:userID", logUserController.findUserLogs);
router.get("/user-logs/lastLogins/:userID", logUserController.lastLoginDates);

// Log Project routes
router.post("/project-logs", logController.create);
router.get("/project-logs/:projectID", logController.findProjectLogs);

module.exports = router;
