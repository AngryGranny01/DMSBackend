const { User } = require("../models/user.model");
const { Log } = require("../models/log.model");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constants/env");
const { Role } = require("../models/role");
const { TargetEnum } = require("../models/targetEnum");
const { ActionEnum } = require("../models/actionEnum");

// Create a new user
exports.create = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    try {
        const userID = await User.create(req.body);
        res.status(201).send({ userID: userID });
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
    }
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
exports.findSalt = async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }
        const salt = await User.findSaltByEmail(email);
        res.send(salt);
    } catch (error) {
        res.status(500).send({ message: 'An error occurred while retrieving the salt.' });
    }
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
            return res.status(500).send({ message: "Error updating User with accountID " + req.body.userID });
        }
        if (data === "not_found") {
            return res.status(404).send({ message: `User with accountID ${req.body.userID} not found.` });
        }
        res.send({ message: `User with accountID ${req.body.userID} was updated successfully!` });
    });
};

// Update User Password
exports.updateUserPassword = (req, res) => {
    const accountID = req.body.accountID;
    const passwordHash = req.body.passwordHash;
    const salt = req.body.salt;

    if (!accountID || !passwordHash || !salt) {
        return res.status(400).send({ message: "Account ID, password hash, and salt are required" });
    }

    User.updatePassword(accountID, passwordHash, salt, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Error updating password for Account ID " + accountID });
        }

        res.send({ message: `User Password with accountID ${req.body.userID} was updated successfully!` });
    });
};

// Deactivate a user account by ID
exports.deactivateAccount = async (req, res) => {
    const accountID = req.params.accountID;

    try {
        const result = await User.deactivateAccount(accountID);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: `Account with ID ${accountID} not found.` });
        }
        res.send({ message: `Account with ID ${accountID} was deactivated successfully!` });
    } catch (error) {
        res.status(500).send({ message: `Error deactivating account with ID ${accountID}.` });
    }
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


// Check login credentials
exports.login = (req, res) => {
    const { email, hashedPassword } = req.body;

    User.findByEmail(email)
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'Invalid User Data' });
            }

            if (hashedPassword !== user.passwordHash) {
                return res.status(401).send({ message: 'Invalid User Data' });
            }

            const userData = {
                userID: user.userID,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                orgUnit: user.orgUnit,
                role: user.role,
                isDeactivated: user.isDeactivated
            };
            const tokenData = {
                userID: user.userID,
                role: user.role
            }
            // Generate JWT token
            const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1h' });
            res.send({ user: userData, token: token });

        })
        .catch(error => {
            console.error('Error finding user by email:', error);
            res.status(500).json({ message: 'Invalid User Data' });
        });
};

exports.lastLoginDates = async (req, res) => {
    try {
        User.getUsersLastLogin((err, data) => {
            if (err) {
                res.status(500).send({
                    message: "Some error occurred while retrieving last login dates."
                });
            } else {
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
        const accountID = decoded.userID;

        // Check if the user already has a password
        const existingPassword = await new Promise((resolve, reject) => {
            User.hasPassword(accountID, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (existingPassword) {
            return res.status(401).send({ message: 'Token has expired.' });
        }

        const userRoleData = await new Promise((resolve, reject) => {
            User.createPassword(accountID, passwordHash, salt, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        const log = {
            actorId: accountID,
            action: ActionEnum.CREATE,
            target: TargetEnum.PASSWORD,
            targetId: accountID,
            field: null,
            value: null,
            currentActorRole: userRoleData.role
        };

        await Log.create(log);

        res.send({ message: `User with id ${accountID} was updated successfully!` });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token has expired.' });
        }
        res.status(400).send('Invalid token');
    }
};