const { Log } = require("../models/log.model");

// Create a new Log
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body || !req.body) {
        return res.status(400).send({
            message: "Invalid or empty request body"
        });
    }

    // Extract log data from request body
    const logData = req.body;

    // Call the create function on the Log model to save the new Log
    Log.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Project Log."
            });
        } else {
            // Return the logID of the newly created Log
            res.send({ logID: data });
        }
    });
};

// Find all Logs by User ID
exports.findUserLogs = (req, res) => {
    Log.findByID(req.query.userID, (err, userLogs) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User Log.'
            });
        } else if (!userLogs || userLogs.length === 0) {
            res.status(404).send({
                message: `User Log with ID ${req.query.userID} was not found.`
            });
        } else {
            res.send(userLogs);
        }
    });
};

// Find Project Logs by Project ID
exports.findProjectLogs = (req, res) => {
    Log.findProjectLogsByID(req.query.projectID, (err, projectLogs) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the Project Log.'
            });
        } else if (!projectLogs || projectLogs.length === 0) {
            res.status(404).send({
                message: `Project Log with ID ${req.query.projectID} was not found.`
            });
        } else {
            res.send(projectLogs);
        }
    });
};
