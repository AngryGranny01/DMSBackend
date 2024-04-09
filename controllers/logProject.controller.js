const { Log } = require("../models/logProject.model");

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
    Log.create(logData, (err,) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Project Log."
            });
        } else {
            // Return nothing
            res.send(null);
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
