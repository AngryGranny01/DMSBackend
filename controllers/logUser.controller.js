const { LogUser } = require("../models/logUser.model");

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
    console.log(logData)

    // Call the create function on the LogUser model to save the new Log
    LogUser.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User Log."
            });
        } else {
            // Return the logID of the newly created Log
            res.send({ logID: data });
        }
    });
};

// Find all Logs by User ID
exports.findUserLogs = (req, res) => {
    LogUser.findByID(req.params.userID, (err, userLogs) => {
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

exports.lastLoginDates = async (req,res) => {
    let senderID = req.params.userID
    try {
        // Call the getUsersLastLogin function on the LogUser model to retrieve last login dates
        LogUser.getUsersLastLogin(senderID,(err, data) => {
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