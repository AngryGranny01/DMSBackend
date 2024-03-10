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

    // Extract movie data from request body
    const userData = {
        userID: 0,
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
    }
    let role;
    if (req.body.isAdmin) {
        role = Role.ADMIN
    } else if (req.body.isProjectManager) {
        role = Role.PROJECT_MANAGER
    } else {
        role = Role.USER
    }

    let lastLogin
    // Extract logs from request body
    // Extract role.

    // Create a new movie instance with the extracted data and ratings
    const movie = new Movie(movieData, role, lastLogin);

    // Call the create function on the Movie model to save the new movie
    Movie.create(movie, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Movie."
            });
        } else {
            // Return the userId of the newly created movie
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
    User.findByID(req.query.username, (err, user) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'An error occurred while retrieving the User.'
            });
        } else if (!user) {
            res.status(404).send({
                message: `User with ID ${req.query.userId} was not found.`
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
    const username = req.query.username;
    if (!username) {
        return res.status(400).send({
            message: "Username is required"
        });
    }

    User.checkIfUsernameAlreadyUsed(username, (err, data) => {
        if (err) {
            console.error("Error occurred while checking if username exists:", error);
            res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        }
        else res.send(data);
    })

}