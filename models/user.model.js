const { connectionPool } = require("./db");
const { Role } = require("./role");
const { sendOneTimeLink, generateToken } = require("../service/emailService")

// User model definition
const User = function (user, role) {
    this.userID = user.userID;
    this.userName = user.userName;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
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

        let isAdmin = false
        let isProjectManager = false

        if (userData.role === Role.ADMIN) {
            isAdmin = true
            isProjectManager = true
        } if (userData.role === Role.PROJECT_MANAGER) {
            isProjectManager = true
        }
        const user = {
            userName: userData.userName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            orgEinheit: userData.orgEinheit,
            isAdmin: isAdmin,
            passwordHash: "",
            salt: ""
        }

        const insertUserSql = 'INSERT INTO user SET ?';

        const [rowsUser] = await conn.query(insertUserSql, user);

        // Generate token for email verification
        const token = generateToken(rowsUser.insertId);

        // Send email with one-time link
        await sendOneTimeLink(userData.email, token);

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
User.getAll = async (response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query all users from the database
        const [userRows] = await conn.query("SELECT * FROM user where userID");

        // Array to store users 
        const users = [];

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
            const user = {
                userID: userRow.userID,
                userName: userRow.userName,
                firstName: userRow.firstName,
                lastName: userRow.lastName,
                email: userRow.email,
                orgEinheit: userRow.orgEinheit,
                passwordHash: userRow.passwordHash,
                role: role
            }

            users.push(user);
        }

        response(null, users);
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

        // If password wasn't changed, retain the old password
        let passwordHash = user.passwordHash;
        let salt = user.salt;
        if (!passwordHash) {
            const [rows] = await conn.query('SELECT passwordHash, salt FROM user WHERE userID = ?', [user.userID]);
            if (rows.length > 0) {
                passwordHash = rows[0].passwordHash;
                salt = rows[0].salt;
            } else {
                throw new Error('User not found');
            }
        }

        let isAdmin = user.role === Role.ADMIN ? true : false;
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
                    isAdmin = ?,
                    orgEinheit = ? 
                WHERE 
                    userID = ?;`,
            [user.userName, user.firstName, user.lastName, user.email, passwordHash, salt, isAdmin, user.orgEinheit, user.userID]
        );

        // Check if the user is a project manager
        if (user.role === Role.PROJECT_MANAGER || user.role === Role.ADMIN) {
            // Check if the user is already in the projectmanager table
            const [managerRows] = await conn.query("SELECT * FROM projectmanager WHERE userID = ?", user.userID);

            // If not, insert the user into the projectmanager table
            if (managerRows.length === 0) {
                await conn.query("INSERT INTO projectmanager (userID) VALUES (?)", [user.userID]);
                console.log("User successfully added as a project manager.");
            } else {
                console.log("User is already a project manager.");
            }
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
        //decodeURIComponent(email)
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE email = ?";
        const [rows,] = await conn.query(query, email);
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
        //decodeURIComponent(username)
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE userName = ?";
        const [rows,] = await conn.query(query, username);
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
        const query = "SELECT passwordHash, userID FROM user WHERE email = ?";
        const [rows] = await conn.query(query, email);

        // If no user found, return null
        if (rows.length === 0) {
            return response(null, null);
        }

        response(null, { passwordHash: rows[0].passwordHash, userID: rows[0].userID });

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
            const user = {
                userID: userData.userID,
                userName: userData.userName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                orgEinheit: userData.orgEinheit,
                role: role
            }


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

User.updatePassword = async (userID, passwordHash, salt, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        let [res] = await conn.query('SELECT passwordHash FROM user WHERE userID = ?', [userID]);

        if (res[0].passwordHash === "") {
            await conn.beginTransaction();
            // Update the password in the database
            await conn.query(
                `UPDATE user SET passwordHash = ?, salt = ? WHERE userID = ?`,
                [passwordHash, salt, userID]
            );
            await conn.commit();
            response(null, `User with ID ${userID} updated successfully`);
        } else {
            const errorMessage = "The user password has already been updated.";
            console.error(errorMessage);
            response(errorMessage, null);
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
