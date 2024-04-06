const { User } = require("../models/user.model");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constants/env");
const { STANDARD_PRIVATE_KEY, STANDARD_PUBLIC_KEY } = require("../constants/env")

// Create a new user
exports.create = async (req, res) => {
    // Validate request body
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // Call the create function on the User model to save the new user
    User.create(req.body, (err, data) => {
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
exports.getAllUsers = (req, res) => {
    // Retrieve all Users from the database .
    console.log("Im Called")
    User.getAll(req.params.senderUserID, (err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        }
        res.send(data);
    });
};

// Retrieve a saltByEmail
exports.findSalt = (req, res) => {
    User.findSaltByEmail(req.query.email, (err, salt) => {
        if (err) {
            return res.status(500).send({
                message: err.message || 'An error occurred while retrieving the Salt.'
            });
        } else if (!salt) {
            return res.status(404).send({
                message: `Salt with email ${req.query.email} was not found.`
            });
        } else {
            res.send(salt);
        }
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

// Update a User by ID
exports.update = (req, res) => {
    // Call the updateByID function on the User model to update the user
    User.updateByID(req.body, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({
                message: "Error updating User with id " + req.body.userID
            });
        } else if (data === "not_found") {
            return res.status(404).send({
                message: `User with id ${req.body.userID} not found.`
            });
        } else {
            res.send({ message: `User with id ${req.body.userID} was updated successfully!` });
        }
    });
};

// Delete a User by ID
exports.delete = (req, res) => {
    // Call the remove method of the User model with the userId query parameter
    User.remove(req.query.userID, (err, data) => {
        if (err) {
            console.error("Error occurred while deleting user:", err);
            return res.status(500).send({
                message: "Could not delete User"
            });
        } else if (data === 0) {
            return res.status(404).send({
                message: `User with id ${req.query.userID} not found.`
            });
        } else {
            res.send({ message: "User was deleted successfully!" });
        }
    });
};




// Check if email already exists
exports.checkIfEmailExist = async (req, res) => {
    if (!req.query.email) {
        return res.status(400).send({
            message: "Email is required"
        });
    }

    User.checkIfEmailAlreadyUsed(req.query.email, (err, data) => {
        if (err) {
            console.error("Error occurred while checking if email exists:", err);
            return res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        } else {
            res.send(data);
        }
    });
};

// Check if username already exists
exports.checkIfUsernameExist = async (req, res) => {
    if (!req.query.username) {
        return res.status(400).send({
            message: "Username is required"
        });
    }
    console.log(req.query)
    User.isUsernameAlreadyUsed(req.query.username, (err, data) => {
        if (err) {
            console.error("Error occurred while checking if username exists:", err);
            return res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        } else {
            res.send(data);
        }
    });
};

exports.checkLogin = async (req, res) => {
    // Validate the presence of required parameters
    if (!req.query.email || !req.query.passwordHash) {
        return res.status(400).send({
            message: "Email and passwordHash are required"
        });
    }

    // Call the checkEmailAndPassword function to validate login credentials
    User.checkEmailAndPassword(req.query.email, req.query.passwordHash, (err, data) => {
        if (err) {
            console.error("Error occurred while checking for Email and Password exists:", err);
            return res.status(500).send({
                message: "Some error occurred while checking if the User exists."
            });
        } else {
            // If no error, send the result (either user data or null if not found)
            res.send(data);
        }
    });
};

//verifys the token and then updates the user password
exports.verifyToken = async (req, res) => {
    const token = req.body.token;
    const passwordHash = req.body.passwordHash;
    const salt = req.body.salt;

    // Check if token is provided
    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        let userID = decoded.userID; // Extract the user ID from the decoded token

        // Update the password asynchronously
        await new Promise((resolve, reject) => {
            User.updatePassword(userID, passwordHash, salt, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        res.send({ message: `User with id ${userID} was updated successfully!` });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token has expired. Please contact admin.');
        }
        console.error('Token verification failed:', error);
        res.status(400).send('Invalid token');
    }
};
