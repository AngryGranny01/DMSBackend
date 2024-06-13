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
  let endDate = new Date(data.projectEndDate);
  const projectData = {
    projectName: data.projectName,
    projectDescription: data.projectDescription,
    projectEndDate: endDate,
    managerID: data.managerID,
  };

  try {
    const project = await Project.create(projectData, data.userIDs);
    res.status(201).send({ projectID: project.projectID });
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

// Update a Project identified by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const projectData = {
    projectID: req.body.projectID,
    projectName: req.body.projectName,
    projectDescription: req.body.projectDescription,
    projectEndDate: req.body.projectEndDate,
    managerID: req.body.managerID,
    userIDs: req.body.userIDs
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
      // If project not found, return 404 Not Found
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