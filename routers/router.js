const express = require("express");
const projectController = require("../controllers/project.controller");
const userController = require("../controllers/user.controller");
const logController = require("../controllers/log.controller");
const logUserController = require("../controllers/logUser.controller");

var router = require("express").Router();

//-------------------------------------------- Create --------------------------------------------------------------//
router.post("/projects", projectController.create);
router.post("/users", userController.create);
router.post("/user-logs", logUserController.create);
router.post("/logs", logController.create);

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

//-------------------------------------------- Update --------------------------------------------------------------//
router.put("/users", userController.update);
router.put("/projects", projectController.update);

//-------------------------------------------- Delete --------------------------------------------------------------//
router.delete("/users", userController.delete);
router.delete("/projects", projectController.delete);

//-------------------------------------------- Check If Exists --------------------------------------------------------------//
router.get("/users/exists", userController.checkIfExist);

module.exports = router