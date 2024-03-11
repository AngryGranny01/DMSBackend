const { Project } = require("../models/project.model");
const { DateTime } = require("../models/convertDateTime");

exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const data = req.body
  // Extract user data from request body
  const projectData = {
    projectName: data.projectName,
    projectDescription: data.projectDescription,
    projectKey: data.projectKey,
    projectEndDate: data.projectEndDate,
    managerID: data.managerID,
    userIDs: data.userIDs
  }

  console.log(projectData)

  Project.create(projectData, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Schedule."
      });
    else res.send(data);
  })
}

// Retrieve all Projects from the database.
exports.findAll = (req, res) => {
  Project.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving all Projects."
      });
    else res.send(data);
  });
};

exports.findOneProject = (req, res) => {
  Project.findByID(req.query.projectID, (err, project) => {
      if (err) {
          res.status(500).send({
              message: err.message || 'An error occurred while retrieving the Project.'
          });
      } else if (!project) {
          res.status(404).send({
              message: `Project with ID ${req.query.projectID} was not found.`
          });
      } else {
          res.send(project);
      }
  });
};

exports.findAllUserProjects = (req, res) => {
  Project.findByUserID(req.query.userID, (err, project) => {
      if (err) {
          res.status(500).send({
              message: err.message || 'An error occurred while retrieving the Projects.'
          });
      } else if (!project) {
          res.status(404).send({
              message: `Projects of User with ID ${req.query.userID} was not found.`
          });
      } else {
          res.send(project);
      }
  });
};

// Update a Project identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
      res.status(400).send({
          message: "Content can not be empty!"
      });
  }

  Project.updateByID(
      req.body,
      (err, data) => {
          if (err) {
              console.error(err);
              res.status(500).send({
                  message: "Error updating Project with id " + req.body.projectID
              });
          } else if (!data || data.affectedRows === 0) {
              res.status(404).send({
                  message: `Project with id ${req.body.projectID} not found.`
              });
          } else {
              res.send({ message: `Project with id ${req.body.projectID} was updated successfully!` });
          }
      }
  );
};

// Delete a Project by ID
exports.delete = (req, res) => {
  // Call the remove method of the Project model with the projectId query parameter
  Project.remove(req.query.projectID, (err, data) => {
      if (err) {
          // If there was an error deleting the Project, send an appropriate response depending on the error type
          if (err.kind === "not_found") {
              res.status(404).send({
                  message: `Project not found.`,
              });
          } else {
              res.status(500).send({
                  message: `Could not delete Project`,
              });
          }
      } else {
          // Send a success message back to the client if the Project was successfully deleted
          res.send({ message: "Project was deleted successfully!" });
      }
  });
};