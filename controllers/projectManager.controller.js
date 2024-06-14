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
    ProjectManager.getProjectManager(req.params.id, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || 'An error occurred while retrieving the ManagerID.'
            });
        } else if (!data) {
            return res.status(404).send({
                message: `Manager with ID ${req.params.id} was not found.`
            });
        } else {
            res.send(data);
        }
    });
};
// Delete a User by ID
exports.delete = (req, res) => {
    // Call the remove method of the User model with the userId query parameter
    ProjectManager.remove(req.query.managerID, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Project Manager not found.`,
                });
            } else {
                return res.status(500).send({
                    message: `Could not delete Project Manager`,
                });
            }
        } else {
            res.send({ message: "User was deleted successfully!" });
        }
    });
};
