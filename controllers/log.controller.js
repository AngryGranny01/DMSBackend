const { Log } = require("../models/log.model")
// Create a new Log
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    const data = req.body[0]
    // Extract user data from request body
    const logData = {
        activityDescription: data.description,
        activityName: data.activityName,
        userID: data.userID,
        projectID: data.projectID,
    }

    console.log(logData)

    // Call the create function on the Log model to save the new Log
    Log.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Project Log."
            });
        } else {
            // Return the userId of the newly created Log
            res.send({ logID: data });
        }
    });
};


exports.findAllByID = (req, res) => {
    Log.findByID(req.query.userID, (err, user) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User Log.'
            });
        } else if (!user) {
            res.status(404).send({
                message: `User Log with ID ${req.query.userID} was not found.`
            });
        } else {
            res.send(user);
        }
    });
};

exports.findProject = (req, res) => {
    Log.findProjectLogsByID(req.query.projectID, (err, project) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the Project Log.'
            });
        } else if (!project) {
            res.status(404).send({
                message: `Project Log with ID ${req.query.projectID} was not found.`
            });
        } else {
            res.send(project);
        }
    });
};