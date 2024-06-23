const { Log } = require("../models/log.model");


// Create a new Log
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body || req.body.length === 0) {
        return res.status(400).send({
            message: "Invalid or empty request body"
        });
    }

    // Extract log data from request body
    const logData = req.body;

    // Call the create function on the LogUser model to save the new Log
    Log.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User Log."
            });
        } else {
            res.send(null);
        }
    });
};


exports.findProjectLogs = (req, res) => {
    Log.findLogsByProjectID(req.params.projectID, (err, projectLogs) => {
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



// Find all Logs by User ID
exports.findUserLogs = (req, res) => {
    Log.findLogsByUserID(req.params.userID, (err, userLogs) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User Log.'
            });
        } else if (!userLogs || userLogs.length === 0) {
            res.status(404).send({
                message: `User Log with ID ${req.query.userID} was not found.`
            });
        } else {
            console.log(userLogs)
            res.send(userLogs);
        }
    });
};

exports.lastLoginDates = async (req,res) => {
    let senderID = req.params.userID
    try {
        // Call the getUsersLastLogin function on the LogUser model to retrieve last login dates
        Log.getUsersLastLogin(senderID,(err, data) => {
            if (err) {
                res.status(500).send({
                    message: "Some error occurred while retrieving last login dates."
                });
            } else {

                // Send the last login dates as a response
                res.send(data);
            }
        });
    } catch (error) {
        console.error("An error occurred: ", error);
        res.status(500).send({
            message: "Internal server error."
        });
    }
};
