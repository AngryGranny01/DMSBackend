const { Role } = require("../models/role");
const { User } = require("../models/user.model")

// Create a new movie
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    const data = req.body[0]
    // Extract user data from request body
    const userData = {
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin,
        isProjectManager: data.isProjectManager
    }

    // Call the create function on the Movie model to save the new movie
    User.create(userData, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Movie."
            });
        } else {
            // Return the userId of the newly created user
            res.send({ userID: data });
        }
    });
};


exports.findAllWithLastLogin = (req, res) => {
    // Retrieve all Users from the database with last Login date.
    User.getAllUsersWithLastLoginDate((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Cinemas."
            });
        else res.send(data);
    });
};


exports.findOne = (req, res) => {
    User.findByID(req.query.userID, (err, user) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User.'
            });
        } else if (!user) {
            res.status(404).send({
                message: `User with ID ${req.query.userID} was not found.`
            });
        } else {
            res.send(user);
        }
    });
};

// Update a CinemaHall identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    User.updateByID(
        req.body,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({
                    message: "Error updating User with id " + req.body[0].userID
                });
            } else if (!data || data.affectedRows === 0) {
                res.status(404).send({
                    message: `User with id ${req.body[0].userID} not found.`
                });
            } else {
                res.send({ message: `User with id ${req.body[0].userID} was updated successfully!` });
            }
        }
    );
};

// Delete a User by ID
exports.delete = (req, res) => {
    // Call the remove method of the User model with the userId query parameter
    User.remove(req.query.userID, (err, data) => {
        if (err) {
            // If there was an error deleting the User, send an appropriate response depending on the error type
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `User not found.`,
                });
            } else {
                res.status(500).send({
                    message: `Could not delete User`,
                });
            }
        } else {
            // Send a success message back to the client if the User was successfully deleted
            res.send({ message: "User was deleted successfully!" });
        }
    });
};


exports.checkIfExist = async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).send({
            message: "Email is required"
        });
    }

    User.checkIfEmailAlreadyUsed(email, (err, data) => {
        if (err) {
            console.error("Error occurred while checking if email exists:", error);
            res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        }
        else res.send(data);
    })

}