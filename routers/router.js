const project = require("../controllers/project.controller");
const user = require("../controllers/user.controller");
const log = require("../controllers/log.controller")
const logUser = require("../controllers/logUser.controller")

var app = require("express").Router();

//-------------------------------------------- Create --------------------------------------------------------------//
app.post("/project", project.create);
app.post("/user", user.create);
app.post("/logUser", logUser.create);
app.post("/log", log.create);

//-------------------------------------------- Retrieve All--------------------------------------------------------------//
app.get("/user", user.findAllWithLastLogin)
app.get("/project", project.findAll)

//-------------------------------------------- Retrieve All By ID --------------------------------------------------------------//
app.get("/log/userLogs", log.findAllByID);
app.get("/project/findProject", project.findAllUserProjects);


//-------------------------------------------- Find By One ID --------------------------------------------------------------//
app.get("/log/findById", log.findLogProject);
app.get("/project/findById", project.findOneProject);


//-------------------------------------------- Update --------------------------------------------------------------//
//app.put("/theater", cinemaHall.update);
app.put("/user", user.update);
app.put("/project", project.update);

//-------------------------------------------- Delete --------------------------------------------------------------//
//app.delete("/theater", cinemaHall.delete);
app.delete("/user", user.delete);
app.delete("/project", project.delete);

//-------------------------------------------- Check If Exists --------------------------------------------------------------//
app.get("/user/isUsed", user.checkIfExist);

module.exports = app