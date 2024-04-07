const { connectionPool } = require("./db");
const { Role } = require("./role");
const { findNewestDate } = require('../utils/convertDateTime');
const { ActivityName } = require('./activityName');
const { sendOneTimeLink, generateToken } = require("../service/emailService")
const crypto = require("../utils/crypto")
const { STANDARD_PRIVATE_KEY, STANDARD_PUBLIC_KEY } = require("../constants/env")
const forge = require('node-forge');
const { response } = require("express");

// User model definition
const User = function (user, role) {
    this.userID = user.userID;
    this.userName = user.userName;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.publicKey = user.publicKey;
    this.salt = user.salt;
    this.orgEinheit = user.orgEinheit
    this.role = role;
};

// Function to create a new user
User.create = async (userData, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        //decrypt Data with standard Private Key becaus no password exists yet
        const decryptedUserData = decryptUser(userData, STANDARD_PRIVATE_KEY)
        let isAdmin = false
        let isProjectManager = false

        if (decryptedUserData.role === Role.ADMIN) {
            isAdmin = true
            isProjectManager = true
        } if (decryptedUserData.role === Role.PROJECT_MANAGER) {
            isProjectManager = true
        }
        const user = {
            userName: decryptedUserData.userName,
            firstName: decryptedUserData.firstName,
            lastName: decryptedUserData.lastName,
            email: decryptedUserData.email,
            orgEinheit: decryptedUserData.orgEinheit,
            isAdmin: isAdmin,
            passwordHash: "",
            salt: "",
            publicKey: STANDARD_PUBLIC_KEY
        }

        const insertUserSql = 'INSERT INTO user SET ?';

        const [rowsUser] = await conn.query(insertUserSql, user);

        // Generate token for email verification
        const token = generateToken(rowsUser.insertId);

        // Send email with one-time link
        await sendOneTimeLink(decryptedUserData.email, token);

        // Check if the user is a project manager or Admin
        if (isProjectManager === true || isAdmin === true) {
            // Insert the user as a project manager
            await conn.query('INSERT INTO ProjectManager (userID) VALUES (?)', [rowsUser.insertId]);
        }

        await conn.commit();
        response(null, rowsUser.insertId);
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new User: ", error);
        response(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


/**
 * Retrieves user data from the database, decrypts it, processes it, 
 * and then encrypts the data before sending it back to the caller.
 */
User.getAll = async (senderUserID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query all users from the database
        const [userRows] = await conn.query("SELECT * FROM user where userID");
        //encrypt Data with public key of sender
        const [publicKeySender] = await conn.query("Select publicKey from User WHERE userID=?", senderUserID)
        // Array to store users 
        const encryptedUsers = [];

        // Iterate through each user
        for (const userRow of userRows) {
            let role;
            // Check user's role
            const [managerRows] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userRow.userID);
            if (userRow.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }
            const user = encryptUser(userRow, role, publicKeySender[0].publicKey)

            encryptedUsers.push(user);
        }

        response(null, encryptedUsers);
    } catch (error) {
        console.error("Error retrieving data from database:", error);
        response({ message: "Error retrieving data from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.updateByID = async (user, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        console.log(user.publicKey)
        const decryptedUserData = decryptUser(user, STANDARD_PRIVATE_KEY)
        let decryptedPasswordHash = crypto.decryptRSA(user.passwordHash, STANDARD_PRIVATE_KEY)
        let isAdmin = decryptedUserData.role === Role.ADMIN ? true : false;
        // Update the user in the database
        await conn.query(
            `UPDATE user 
                SET 
                    userName = ?, 
                    firstName = ?, 
                    lastName = ?, 
                    email = ?, 
                    passwordHash = ?,
                    salt = ?, 
                    publicKey = ?,
                    isAdmin = ?,
                    orgEinheit = ? 
                WHERE 
                    userID = ?;`,
            [decryptedUserData.userName, decryptedUserData.firstName, decryptedUserData.lastName, decryptedUserData.email, decryptedPasswordHash, user.salt, user.publicKey, isAdmin, decryptedUserData.orgEinheit, decryptedUserData.userID]
        );

        // Check if the user is a project manager
        if (decryptedUserData.role === Role.PROJECT_MANAGER || decryptedUserData.role === Role.ADMIN) {
            // Check if the user is already in the projectmanager table
            const [managerRows] = await conn.query("SELECT * FROM projectmanager WHERE userID = ?", decryptedUserData.userID);

            // If not, insert the user into the projectmanager table
            if (managerRows.length === 0) {
                await conn.query("INSERT INTO projectmanager (userID) VALUES (?)", [decryptedUserData.userID]);
                console.log("User successfully added as a project manager.");
            } else {
                console.log("User is already a project manager.");
            }
        }

        //Update ProjectUserKey
        let projectKeyQuery = `
        SELECT Project.projectKey 
        FROM Project 
        INNER JOIN 
            Project_User 
        ON 
            Project.projectID = Project_User.projectID 
        WHERE 
            Project_User.userID = ?;`

        const [projectKeys] = await conn.query(projectKeyQuery, decryptedUserData.userID);

        for (const projectKeyRow of projectKeys) {
            //get public key for every user
            //decrypt Data with private key of sender
            const [publicKeyUser] = await conn.query("Select publicKey from User WHERE userID=?", decryptedUser.userID)
            const userProjectKey = crypto.encryptRSA(projectKeyRow.projectKey, publicKeyUser);
            await conn.query("UPDATE Project_User SET userProjectKey = ? WHERE userID = ?;", [userProjectKey, decryptedUser.userID]);
        }

        await conn.commit();
        response(null, "Users updated successfully");
    } catch (error) {
        console.error("Error occurred while updating users: ", error);
        await conn.rollback();
        response({ message: "Error occurred while updating users" }, null); // Pass error message to callback
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.remove = async (userID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        // Delete user from activitylog table
        await conn.query("DELETE FROM activitylog WHERE userID = ?", userID);
        await conn.query("DELETE FROM activitylogUser WHERE userID = ?", userID);

        // Delete user from project_user table
        await conn.query("DELETE FROM project_user WHERE userID = ?", userID);

        // Delete user from projectmanager table
        await conn.query("DELETE FROM projectmanager WHERE userID = ?", userID);

        // Delete user from user table
        const [userDeleteResult] = await conn.query("DELETE FROM user WHERE userID = ?", userID);

        await conn.commit();
        response(null, userDeleteResult.affectedRows);
    } catch (error) {
        console.error("Error occurred while deleting the user: ", error);
        await conn.rollback();
        response({ message: "Error occurred while deleting the user" }, null); // Pass error message to callback
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// Function to check if email already exists
User.checkIfEmailAlreadyUsed = async (email, response) => {
    let conn;
    try {
        let decrpytedEmail = crypto.decryptRSA(decodeURIComponent(email), STANDARD_PRIVATE_KEY)
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE email = ?";
        const [rows,] = await conn.query(query, decrpytedEmail);
        if (rows.length === 0) {
            response(null, { exist: false });
        } else {
            response(null, { exist: true });
        }
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// Function to check if email already exists
User.isUsernameAlreadyUsed = async (username, response) => {
    let conn;
    try {
        let decrpytedUsername = crypto.decryptRSA(decodeURIComponent(username), STANDARD_PRIVATE_KEY)
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE userName = ?";
        const [rows,] = await conn.query(query, decrpytedUsername);
        if (rows.length === 0) {
            response(null, { exist: false });
        } else {
            response(null, { exist: true });
        }
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.checkPassword = async (email, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT passwordHash,publicKey,userID FROM user WHERE email = ?";
        const [rows] = await conn.query(query, email);

        // If no user found, return null
        if (rows.length === 0) {
            return response(null, null);
        }
        let encryptedPassword = crypto.encryptRSA(rows[0].passwordHash, rows[0].publicKey)

        response(null, { passwordHash: encryptedPassword, userID: rows[0].userID, publicKey: rows[0].publicKey });

    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

User.findByID = async (userID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE userID = ?";
        const [rows] = await conn.query(query, userID);

        // If no user found, return null
        if (rows.length > 0) {

            let userData = rows[0]

            // Determine user's role
            let role;
            let [managerRows] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userData.userID);
            if (userData.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            // Create the user object
            const user = encryptUser(userData, role, userData.publicKey)

            response(null, user);
        } else {
            // User not found
            const error = { message: `User with ID ${userID} not found` };
            response(error, null);
        }
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

function encryptUser(userData, role, publicKey) {
    const encryptedUser = {
        userID: userData.userID,
        userName: crypto.encryptRSA(userData.userName, publicKey),
        firstName: crypto.encryptRSA(userData.firstName, publicKey),
        lastName: crypto.encryptRSA(userData.lastName, publicKey),
        email: crypto.encryptRSA(userData.email, publicKey),
        orgEinheit: crypto.encryptRSA(userData.orgEinheit, publicKey),
        role: crypto.encryptRSA(role, publicKey),
        publicKey: userData.publicKey
    };
    return encryptedUser;
}

function decryptUser(encryptedUserData, privateKey) {
    const decryptedUser = {
        userID: encryptedUserData.userID,
        userName: crypto.decryptRSA(encryptedUserData.userName, privateKey),
        firstName: crypto.decryptRSA(encryptedUserData.firstName, privateKey),
        lastName: crypto.decryptRSA(encryptedUserData.lastName, privateKey),
        email: crypto.decryptRSA(encryptedUserData.email, privateKey),
        orgEinheit: crypto.decryptRSA(encryptedUserData.orgEinheit, privateKey),
        role: crypto.decryptRSA(encryptedUserData.role, privateKey)
    };
    return decryptedUser;
}

User.updatePassword = async (userID, passwordHash, salt, publicKey, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        let [res] = await conn.query('SELECT publicKey FROM user WHERE userID = ?', [userID]);

        if (res[0].publicKey === STANDARD_PUBLIC_KEY) {
            await conn.beginTransaction();
            // Update the password in the database
            await conn.query(
                `UPDATE user SET passwordHash = ?, salt = ?, publicKey = ? WHERE userID = ?`,
                [passwordHash, salt, publicKey, userID]
            );
            await conn.commit();
            response(null, `User with ID ${userID} updated successfully`);
        } else {
            const errorMessage = "The user password has already been updated.";
            console.error(errorMessage);
            response(errorMessage, null);
            return;
        }
    } catch (error) {
        console.error("Error occurred while updating users: ", error);
        await conn.rollback();
        response(`Error updating user with ID ${userID}`, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};



User.findSaltByEmail = async (email, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query the database to find the user by userId
        const [rows,] = await conn.query('SELECT salt FROM user WHERE email = ?', [email]);
        if (rows.length > 0) {
            //return the salt
            response(null, rows[0]);
        } else {
            // User not found
            response({ message: `Salt with email ${email} not found` }, null);
        }
    } catch (error) {
        console.error("Error retrieving user from database:", error);
        response({ message: "Error retrieving user from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}




module.exports = {
    User
};
