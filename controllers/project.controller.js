const { Project } = require("../models/project.model");

// Create a new project
exports.create = async (req, res) => {
  if (!req.body) {
    // If request body is empty, return 400 Bad Request
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const data = req.body;
  // Extract project data from request body
  const projectData = {
    projectName: data.projectName,
    projectDescription: data.projectDescription,
    projectKey: data.projectKey,
    projectEndDate: data.projectEndDate,
    managerID: data.managerID,
    userIDs: data.userIDs
  };

  // Create the project in the database
  Project.create(projectData, (err, data) => {
    if (err) {
      // If an error occurs, return 500 Internal Server Error
      return res.status(500).send({
        message: err.message || "Some error occurred while creating the Project."
      });
    }
    // If successful, return the created project data
    res.send(data);
  });
};

// Retrieve all Projects from the database
exports.findAll = (req, res) => {
  Project.getAll((err, data) => {
    if (err) {
      // If an error occurs, return 500 Internal Server Error
      return res.status(500).send({
        message: err.message || "Some error occurred while retrieving all Projects."
      });
    }
    // If successful, return all projects
    res.send(data);
  });
};

// Retrieve a specific Project by ID
exports.findOneProject = (req, res) => {
  Project.findByID(req.params.id, (err, project) => {
    if (err) {
      // If an error occurs, return 500 Internal Server Error
      return res.status(500).send({
        message: err.message || 'An error occurred while retrieving the Project.'
      });
    }
    if (!project) {
      // If project is not found, return 404 Not Found
      return res.status(404).send({
        message: `Project with ID ${req.params.id} was not found.`
      });
    }
    // If successful, return the project
    res.send(project);
  });
};

// Retrieve all Projects associated with a specific User
exports.findAllUserProjects = (req, res) => {
  Project.findProjectsByUserID(req.query.userID, (err, projects) => {
    if (err) {
      // If an error occurs, return 500 Internal Server Error
      return res.status(500).send({
        message: err.message || 'An error occurred while retrieving the Projects.'
      });
    }
    if (!projects) {
      // If no projects are found for the user, return 404 Not Found
      return res.status(404).send({
        message: `Projects of User with ID ${req.query.userID} were not found.`
      });
    }
    // If successful, return the projects
    res.send(projects);
  });
};

// Update a Project identified by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    // If request body is empty, return 400 Bad Request
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateByID(req.body, (err, data) => {
    if (err) {
      // If an error occurs, return 500 Internal Server Error
      console.error(err);
      return res.status(500).send({
        message: "Error updating Project with ID " + req.body.projectID
      });
    }
    if (!data || data.affectedRows === 0) {
      // If no project was updated, return 404 Not Found
      return res.status(404).send({
        message: `Project with ID ${req.body.projectID} not found.`
      });
    }
    // If successful, return success message
    res.send({ message: `Project with ID ${req.body.projectID} was updated successfully!` });
  });
};

// Delete a Project by ID
exports.delete = (req, res) => {
  // Call the remove method of the Project model with the projectId query parameter
  Project.remove(req.query.projectID, (err, data) => {
    if (err) {
      // If an error occurs, handle different error types
      if (err.kind === "not_found") {
        // If project not found, return 404 Not Found
        return res.status(404).send({
          message: `Project not found.`,
        });
      }
      // For other errors, return 500 Internal Server Error
      return res.status(500).send({
        message: `Could not delete Project`,
      });
    }
    // If successful, return success message
    res.send({ message: "Project was deleted successfully!" });
  });
};