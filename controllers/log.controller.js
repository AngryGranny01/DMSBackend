const { Log } = require("../models/log.model");

// Create a new Log
exports.create = async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send({ message: "Invalid or empty request body" });
    }

    const logData = req.body;
    try {
        await Log.create(logData);
        res.send(null);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the Log." });
    }
};

exports.findProjectLogs = async (req, res) => {
    try {
        const projectLogs = await Log.findLogsByProjectID(req.params.projectID);
        if (!projectLogs || projectLogs.length === 0) {
            res.status(404).send({ message: `Project Log with ID ${req.params.projectID} was not found.` });
        } else {
            res.send(projectLogs);
        }
    } catch (err) {
        res.status(500).send({ message: err.message || 'An error occurred while retrieving the Project Log.' });
    }
};

exports.findUserLogs = async (req, res) => {
    try {
        const userLogs = await Log.findLogsByUserID(req.params.userID);
        if (!userLogs || userLogs.length === 0) {
            res.status(404).send({ message: `User Log with ID ${req.params.userID} was not found.` });
        } else {
            res.send(userLogs);
        }
    } catch (err) {
        res.status(500).send({ message: err.message || 'An error occurred while retrieving the User Log.' });
    }
};
