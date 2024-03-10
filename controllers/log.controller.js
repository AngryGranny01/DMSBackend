const { CinemaHall } = require("../models/cinemaHall.model");


exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  CinemaHall.create(req.body, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Cinema."
      });
    else res.send({ theaterId: data });
  });
};

// Retrieve all Cinemas from the database (with condition).
exports.findAll = (req, res) => {
  CinemaHall.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Cinemas."
      });
    else res.send(data);
  });
};

// Find a single Cinemas with a id

exports.findOne = (req, res) => {
  CinemaHall.findById(req.query.hallId, (err, hall) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'An error occurred while retrieving the cinema hall.'
      });
    } else if (!hall) {
      res.status(404).send({
        message: `Cinema hall with ID ${req.query.hallId} was not found.`
      });
    } else {
      res.send(hall);
    }
  });
};

// Update a CinemaHall identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  CinemaHall.updateById(
    req.query.hallId,
    req.body,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Error updating CinemaHall with id " + req.query.hallId
        });
      } else if (!data || data.affectedRows === 0) {
        res.status(404).send({
          message: `CinemaHall with id ${req.query.hallId} not found.`
        });
      } else {
        res.send({ message: `CinemaHall with id ${req.query.hallId} was updated successfully!` });
      }
    }
  );
};

exports.delete = (req, res) => {
  CinemaHall.remove(req.query.hallId, (err, data) => {
    console.log(data)
    if (err) {
      console.error(err);
      res.status(500).send({
        message: "An error occurred while deleting the CinemaHall."
      });
    } else if (!data || data.affectedRows === 0) {
      res.status(404).send({
        message: `CinemaHall with id ${req.query.hallId} not found.`
      });
    } else {
      res.send({ message: `CinemaHall with id ${req.query.hallId} was deleted successfully!` });
    }
  });
};