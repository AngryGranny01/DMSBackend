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
    const logData = req.body[0];

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