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

exports.lastLoginDates = async (req,res) => {
    try {
        // Call the getUsersLastLogin function on the LogUser model to retrieve last login dates
        LogUser.getUsersLastLogin((err, data) => {
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


exports.lastLoginDate = async (req,res) => {
    try {
        // Call the getUserLastLogin function on the LogUser model to retrieve last login date
        LogUser.getUserLastLogin(req.query.userID,(err, data) => {
            if (err) {
                console.error("Error occurred while retrieving last login date: ", err);
                res.status(500).send({
                    message: "Some error occurred while retrieving last login date."
                });
            } else {
                // Send the last login date as a response
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
