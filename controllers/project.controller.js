const { Project } = require("../models/project.model");
const { DateTime } = require("../models/convertDateTime");

exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const dateTime = {
    year: req.body.dateTime.year,
    month: req.body.dateTime.month,
    day: req.body.dateTime.day,
    hour: req.body.dateTime.hour,
    minute: req.body.dateTime.minute,
  }
  const dateJSON = DateTime.convertToJson(dateTime)
  const project = {
    movieID: req.body.movieId,
    theaterID: req.body.hallId,
    scheduleDateTime: dateJSON
  }
  console.log(project)

  Project.create(project, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Schedule."
      });
    else res.send(data);
  })
}