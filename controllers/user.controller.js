const { User } = require("../models/user.model");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constants/env");
const EncryptionService = require('../service/encryptionService');
const { Role } = require("../models/role");

// Create a new user
exports.create = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    User.create(req.body, (err, data) => {
        if (err) {
            return res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
        }
        res.send({ userID: data });
    });
};

// Retrieve all Users
exports.getAllUsers = (req, res) => {
    User.getAll((err, data) => {
        if (err) {
            return res.status(500).send({ message: err.message || "Some error occurred while retrieving Users." });
        }
        res.send(data);
    });
};

// Retrieve salt by email
exports.findSalt = (req, res) => {
    User.findSaltByEmail(req.query.email, (err, salt) => {
        if (err) {
            return res.status(500).send({ message: err.message || 'An error occurred while retrieving the Salt.' });
        }
        if (!salt) {
            return res.status(404).send({ message: `Salt with email ${req.query.email} was not found.` });
        }
        res.send(salt);
    });
};

// Retrieve a specific User by ID
exports.findOne = (req, res) => {
    User.findByID(req.params.userID, (err, user) => {
        if (err) {
            return res.status(500).send({ message: err.message || 'An error occurred while retrieving the User.' });
        }
        if (!user) {
            return res.status(404).send({ message: `User with ID ${req.params.userID} was not found.` });
        }
        res.send(user);
    });
};

// Update a User by ID
exports.update = (req, res) => {
    User.updateByID(req.body, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Error updating User with id " + req.body.userID });
        }
        if (data === "not_found") {
            return res.status(404).send({ message: `User with id ${req.body.userID} not found.` });
        }
        res.send({ message: `User with id ${req.body.userID} was updated successfully!` });
    });
};

// Delete a User by ID
exports.delete = (req, res) => {
    User.remove(req.params.userID, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Could not delete User" });
        }
        if (data === 0) {
            return res.status(404).send({ message: `User with id ${req.params.userID} not found.` });
        }
        res.send({ message: "User was deleted successfully!" });
    });
};

// Check if email already exists
exports.checkIfEmailExist = (req, res) => {
    if (!req.query.email) {
        return res.status(400).send({ message: "Email is required" });
    }

    User.checkIfEmailAlreadyUsed(req.query.email, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Some error occurred while checking if the User exists." });
        }
        res.send(data);
    });
};

// Check if username already exists
exports.checkIfUsernameExist = (req, res) => {
    if (!req.query.username) {
        return res.status(400).send({ message: "Username is required" });
    }

    User.isUsernameAlreadyUsed(req.query.username, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Some error occurred while checking if the User exists." });
        }
        res.send(data);
    });
};

// Check login credentials
exports.login = (req, res) => {
    const { email, passwordPlain } = req.body;

    User.findByEmail(email)
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            const encryptionService = new EncryptionService();
            const hashedPassword = encryptionService.getPBKDF2Key(passwordPlain, user.salt);

            if (hashedPassword !== user.passwordHash) {
                return res.status(401).send({ message: 'Invalid password' });
            }

            User.isProjectManager(user.userID)
                .then(isProjectManager => {
                    const userRole = user.isAdmin ? Role.ADMIN : isProjectManager ? Role.PROJECT_MANAGER : Role.USER;

                    const userData = {
                        userID: user.userID,
                        userName: user.userName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        salt: user.salt,
                        orgEinheit: user.orgEinheit,
                        role: userRole
                    };

                    res.send({ user: userData });
                })
                .catch(error => {
                    console.error('Error checking project manager status:', error);
                    res.status(500).json({ message: 'Internal server error' });
                });
        })
        .catch(error => {
            console.error('Error finding user by email:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
};

// Verify token and update password
exports.verifyToken = async (req, res) => {
    const token = req.body.token;
    const passwordHash = req.body.passwordHash;
    const salt = req.body.salt;

    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userID = decoded.userID;

        await new Promise((resolve, reject) => {
            User.updatePassword(userID, passwordHash, salt, (err, data) => {
                if (err) {
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
        res.status(400).send('Invalid token');
    }
};
