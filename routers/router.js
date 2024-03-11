const project = require("../controllers/project.controller");
const user = require("../controllers/user.controller");
const logProject = require("../controllers/logProject.controller")
const logUser = require("../controllers/logUser.controller")

var app = require("express").Router();

//-------------------------------------------- Create --------------------------------------------------------------//
app.post("/project", project.create);
app.post("/user", user.create);
app.post("/logUser", logUser.create);

//-------------------------------------------- Retrieve All--------------------------------------------------------------//
//app.get("/theater", cinemaHall.findAll);
app.get("/user", user.findAllWithLastLogin)

//-------------------------------------------- Find By ID --------------------------------------------------------------//
//app.get("/theater/findById", cinemaHall.findOne);
app.get("/user/findById", user.findOne);
app.get("/logUser/findById", logUser.findOne);


//-------------------------------------------- Update --------------------------------------------------------------//
//app.put("/theater", cinemaHall.update);
app.put("/user", user.update);

//-------------------------------------------- Delete --------------------------------------------------------------//
//app.delete("/theater", cinemaHall.delete);
app.delete("/user", user.delete);

//-------------------------------------------- Check If Exists --------------------------------------------------------------//
app.get("/user/isUsed", user.checkIfExist);

module.exports = app