const { Log } = require("../models/log.model");


// Create a new Log
exports.create = async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send({ message: "Invalid or empty request body" });
    }

    const logData = req.body;
    Log.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while creating the Log." });
        } else {
            res.send(null);
        }
    });
};

exports.findProjectLogs = (req, res) => {
    Log.findLogsByProjectID(req.params.projectID, (err, projectLogs) => {
        if (err) {
            res.status(500).send({ message: err.message || 'An error occurred while retrieving the Project Log.' });
        } else if (!projectLogs || projectLogs.length === 0) {
            res.status(404).send({ message: `Project Log with ID ${req.params.projectID} was not found.` });
        } else {
            res.send(projectLogs);
        }
    });
};

exports.findUserLogs = (req, res) => {
    Log.findLogsByUserID(req.params.userID, (err, userLogs) => {
        if (err) {
            res.status(500).send({ message: err.message || 'An error occurred while retrieving the User Log.' });
        } else if (!userLogs || userLogs.length === 0) {
            res.status(404).send({ message: `User Log with ID ${req.params.userID} was not found.` });
        } else {
            res.send(userLogs);
        }
    });
};
