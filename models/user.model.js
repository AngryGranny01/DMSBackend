const { connectionPool } = require("./db");
const { Role } = require("./role");
const { findNewestDate } = require('./convertDateTime');
const { ActivityName } = require('./activityName');

// User model definition
const User = function (user, role, lastLogin) {
    this.userID = user.userID;
    this.userName = user.username;
    this.firstName = user.firstname;
    this.lastName = user.lastname;
    this.email = user.email;
    this.passwordHash = user.password;
    this.role = role;
    this.lastLogin = lastLogin;
};

// Function to create a new user
User.create = async (userData, isProjectManager, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        const insertUserSql = 'INSERT INTO user SET ?';

        const [rowsUser, fieldsUser] = await conn.query(insertUserSql, userData);

        // Check if the user is a project manager or Admin
        if (isProjectManager === true || userData.isAdmin === true) {
            // Insert the user as a project manager
            await conn.query('INSERT INTO ProjectManager (userID) VALUES (?)', [rowsUser.insertId]);
        }

        await conn.commit();
        result(null, { id: rowsUser.insertId });
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new User: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to retrieve all users with last login date
User.getAllUsersWithLastLoginDate = async (result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query all users from the database
        const [userRows] = await conn.query("SELECT * FROM user");

        // Array to store users with last login date
        const usersWithLastLogin = [];

        // Iterate through each user
        for (const userRow of userRows) {
            let role;

            // Check user's role
            let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userRow.userID);
            if (userRow.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            // Query the last login date for the current user
            const selectLastLoginSql = `
            SELECT DISTINCT
                HOUR(timeStampUser) AS hour,
                MONTH(timeStampUser) AS month,
                YEAR(timeStampUser) AS year,
                MINUTE(timeStampUser) AS minute,
                DAY(timeStampUser) AS day
            FROM 
                ActivityLogUser
            WHERE 
                userID = ? 
                AND (activityName = 'LOGIN' OR activityName = 'CREATED')
            `;

            let [logRows, logFields] = await conn.query(selectLastLoginSql, userRow.userID);

            // Extract last login date
            const lastLogin = findNewestDate(logRows);

            // Create user object with last login date
            const user = new User({
                userID: userRow.userID,
                username: userRow.userName,
                firstname: userRow.firstName,
                lastname: userRow.lastName,
                password: userRow.passwordHash,
                email: userRow.email,
            }, role, lastLogin);

            usersWithLastLogin.push(user);
        }

        result(null, usersWithLastLogin);
    } catch (error) {
        console.error("Error retrieving data from database:", error);
        result({ message: "Error retrieving data from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to find a user by ID
User.findByID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query the database to find the user by userId
        const [rows,] = await conn.query('SELECT * FROM user WHERE userID = ?', [userID]);

        // If the user is found, return it
        if (rows.length > 0) {
            let userData = rows[0];
            let role;

            // Determine user's role
            let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userID);
            if (userData.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            // Query the last login date for the current user
            const selectLastLoginSql = `
            SELECT DISTINCT
                HOUR(timeStampUser) AS hour,
                MONTH(timeStampUser) AS month,
                YEAR(timeStampUser) AS year,
                MINUTE(timeStampUser) AS minute,
                DAY(timeStampUser) AS day
            FROM 
                ActivityLogUser
            WHERE 
                userID = ? 
                AND (activityName = '${ActivityName.LOGIN}' OR activityName = '${ActivityName.CREATE_USER}')
            `;

            let [logRows, logFields] = await conn.query(selectLastLoginSql, userID);

            // Extract last login date
            const lastLogin = findNewestDate(logRows);

            // Create the user object
            const user = new User({
                userID: userData.userID,
                username: userData.userName,
                firstname: userData.firstName,
                lastname: userData.lastName,
                email: userData.email,
                password: userData.passwordHash,
            }, role, lastLogin);

            result(null, user);
        } else {
            // User not found
            result({ message: `User with ID ${userID} not found` }, null);
        }
    } catch (error) {
        console.error("Error retrieving user from database:", error);
        result({ message: "Error retrieving user from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to update user by ID
User.updateByID = async (user, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

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
                    isAdmin = ? 
                WHERE 
                    userID = ?;`,
            [user.userName, user.firstName, user.lastName, user.email, user.passwordHash, isAdmin, user.userID]
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
        result(null, "Users updated successfully");
    } catch (error) {
        console.error("Error occurred while updating users: ", error);
        await conn.rollback();
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to delete user by ID
User.remove = async (userID, result) => {
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
        result(null, userDeleteResult.affectedRows);
    } catch (error) {
        console.error("Error occurred while deleting the user: ", error);
        await conn.rollback();
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to check if email already exists
User.checkIfEmailAlreadyUsed = async (email, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE email = ?";
        const [rows, fields] = await conn.query(query, email);
        if (rows.length === 0) {
            result(null, { exist: false });
        } else {
            result(null, { exist: true });
        }
    } catch (err) {
        result(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to check if email already exists
User.checkIfUsernameAlreadyUsed = async (username, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE userName = ?";
        const [rows, fields] = await conn.query(query, username);
        if (rows.length === 0) {
            result(null, { exist: false });
        } else {
            result(null, { exist: true });
        }
    } catch (err) {
        result(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.checkEmailAndPassword = async (email, password, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE email = ? AND passwordHash = ?";
        const [rows, fields] = await conn.query(query, [email, password]);
        if (rows.length === 0) {
            result(null, {});
        } else {
            let userData = rows[0]
            // Determine user's role
            let role;
            let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userData.userID);
            if (userData.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            // Query the last login date for the current user
            const selectLastLoginSql = `
            SELECT DISTINCT
              HOUR(timeStampUser) AS hour,
              MONTH(timeStampUser) AS month,
              YEAR(timeStampUser) AS year,
              MINUTE(timeStampUser) AS minute,
              DAY(timeStampUser) AS day
            FROM 
              ActivityLogUser
            WHERE 
              userID = ? 
              AND (activityName = '${ActivityName.LOGIN}' OR activityName = '${ActivityName.CREATE_USER}')
          `;

            let [logRows, logFields] = await conn.query(selectLastLoginSql, userData.userID);

            // Extract last login date
            const lastLogin = findNewestDate(logRows);

            // Create the user object
            const user = new User({
                userID: userData.userID,
                username: userData.userName,
                firstname: userData.firstName,
                lastname: userData.lastName,
                email: userData.email,
                password: userData.passwordHash,
            }, role, lastLogin);
            result(null, user);
        }
    } catch (err) {
        result(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


module.exports = {
    User
};
