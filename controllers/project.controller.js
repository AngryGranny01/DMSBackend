const { Project } = require("../models/project.model");

// Create a new project
exports.create = async (req, res) => {
  if (!req.body) {
      return res.status(400).send({
          message: "Content can not be empty!"
      });
  }

  const data = req.body;
  const projectData = {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectEndDate: data.projectEndDate ? new Date(data.projectEndDate) : null,
      managerID: data.managerID,
  };

  const userIDs = data.userIDs.map(user => user.userID);

  try {
      const projectID = await Project.create(projectData, userIDs);
      res.status(201).send({ projectID });
  } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).send({ message: 'Internal server error' });
  }
};

// Retrieve all Projects from the database
exports.findAll = async (req, res) => {
  try {
    const projects = await Project.getAll();
    res.status(200).send(projects);
  } catch (err) {
    console.error('Error retrieving all projects:', err);
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving all Projects."
    });
  }
};

// Retrieve all Projects associated with a specific User
exports.findUserProjects = async (req, res) => {
  try {
    const userID = req.params.userID;
    const projects = await Project.findByUserID(userID);

    if (!projects || projects.length === 0) {
      // If no projects are found for the user, return 404 Not Found
      return res.status(404).send({
        message: `Projects of User with ID ${userID} were not found.`
      });
    }

    // If successful, return the projects
    res.status(200).send(projects);
  } catch (err) {
    // If an error occurs, return 500 Internal Server Error
    console.error('An error occurred while retrieving the Projects:', err);
    res.status(500).send({
      message: err.message || 'An error occurred while retrieving the Projects.'
    });
  }
};

/**
 * Update a Project identified by the id in the request.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const data = req.body;
  // Convert userIDs to a simple array of numbers
  const userIDs = data.userIDs.map(user => user.userID);
  const projectData = {
    projectID: data.projectID,
    projectName: data.projectName,
    projectDescription: data.projectDescription,
    projectEndDate: data.projectEndDate,
    managerID: data.managerID,
    userIDs: userIDs
  };

  try {
    const result = await Project.updateByID(projectData);
    if (result) {
      res.send({ message: `Project with ID ${projectData.projectID} was updated successfully!` });
    } else {
      res.status(404).send({ message: `Project not found with ID ${projectData.projectID}` });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

// Delete a Project by ID
exports.delete = async (req, res) => {
  try {
    const projectID = req.query.projectID;

    if (!projectID) {
      return res.status(400).send({
        message: "Project ID is required"
      });
    }

    const result = await Project.remove(projectID);

    if (result === 0) {
      return res.status(404).send({
        message: `Project not found.`
      });
    }

    // If successful, return success message
    res.send({ message: "Project was deleted successfully!" });
  } catch (err) {
    console.error(`Error deleting project with ID ${req.query.projectID}:`, err);
    // For other errors, return 500 Internal Server Error
    res.status(500).send({
      message: `Could not delete Project`
    });
  }
};