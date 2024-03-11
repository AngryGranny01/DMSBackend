const { LogUser } = require("../models/logUser.model")
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
    }

    console.log(logData)

    // Call the create function on the Log model to save the new Log
    LogUser.create(logData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User Log."
            });
        } else {
            // Return the userId of the newly created Log
            res.send({ logID: data });
        }
    });
};
