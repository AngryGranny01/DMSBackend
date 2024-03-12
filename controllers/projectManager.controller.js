const { ProjectManager } = require("../models/projectManager.model");

// Update a User identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.query.userID || !req.query.managerID) {
        return res.status(400).send({
            message: "User ID and Manager ID are required!"
        });
    }

    ProjectManager.updateByID(req.query.userID, req.query.managerID, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Error updating Projects with Project Manager ID " + req.query.userID
            });
        } else if (!data || data.affectedRows === 0) {
            return res.status(404).send({
                message: `Projects with Project Manager ID ${req.query.userID} not found.`
            });
        } else {
            res.send({ message: `Projects with Project Manager ID ${req.query.userID} was updated successfully!` });
        }
    });
};

// Retrieve a specific managerID by userID
exports.findManagerID = (req, res) => {
    ProjectManager.getProjectManagerIDByUserID(req.params.id, (err, managerID) => {
        if (err) {
            return res.status(500).send({
                message: err.message || 'An error occurred while retrieving the ManagerID.'
            });
        } else if (!managerID) {
            return res.status(404).send({
                message: `Manager with ID ${req.params.id} was not found.`
            });
        } else {
            res.send({managerID: managerID});
        }
    });
};
