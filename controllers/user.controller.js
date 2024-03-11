const { User } = require("../models/user.model");

// Create a new user
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const data = req.body;
    // Extract user data from request body
    const userData = {
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin,
        isProjectManager: data.isProjectManager
    };

    // Call the create function on the User model to save the new user
    User.create(userData, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        } else {
            // Return the userId of the newly created user
            res.send({ userID: data });
        }
    });
};

// Retrieve all Users with last login date
exports.findAllWithLastLogin = (req, res) => {
    // Retrieve all Users from the database with last Login date.
    User.getAllUsersWithLastLoginDate((err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users with last login."
            });
        }
        res.send(data);
    });
};

// Retrieve a specific User by ID
exports.findOne = (req, res) => {
    User.findByID(req.params.id, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User.'
            });
        } else if (!user) {
            return res.status(404).send({
                message: `User with ID ${req.params.id} was not found.`
            });
        } else {
            res.send(user);
        }
    });
};

// Update a User identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    User.updateByID(req.body, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Error updating User with id " + req.body[0].userID
            });
        } else if (!data || data.affectedRows === 0) {
            return res.status(404).send({
                message: `User with id ${req.body[0].userID} not found.`
            });
        } else {
            res.send({ message: `User with id ${req.body[0].userID} was updated successfully!` });
        }
    });
};

// Delete a User by ID
exports.delete = (req, res) => {
    // Call the remove method of the User model with the userId query parameter
    User.remove(req.query.userID, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `User not found.`,
                });
            } else {
                return res.status(500).send({
                    message: `Could not delete User`,
                });
            }
        } else {
            res.send({ message: "User was deleted successfully!" });
        }
    });
};

//TODO: Why isnt this working
// Check if email already exists
exports.checkIfExist = async (req, res) => {
    if (!req.query.email) {
        return res.status(400).send({
            message: "Email is required"
        });
    }

    User.checkIfEmailAlreadyUsed(req.query.email, (err, data) => {
        if (err) {
            console.error("Error occurred while checking if email exists:", error);
            return res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        } else {
            res.send(data);
        }
    });
};