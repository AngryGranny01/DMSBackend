const { connectionPool } = require("./db");
const { Role } = require("./role");
const { findNewestDate } = require('./convertDateTime');

const User = function (user, role, lastLogin) {
    this.userID = user.userID;
    this.userName = user.username;
    this.firstName = user.firstname;
    this.lastName = user.lastname;
    this.email = user.email;
    this.passwordHash = user.password;
    this.role = role
    this.lastLogin = lastLogin;
};


User.create = async (newUser, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        const insertUserSql = 'INSERT INTO user SET ?'
        const userData = {
            userName: newUser.username,
            firstName: newUser.firstname,
            lastName: newUser.lastname,
            email: newUser.email,
            passwordHash: newUser.password,
            isAdmin: newUser.isAdmin,
        }
        console.log(userData)
        const [rowsUser, fieldsUser] = await conn.query(insertUserSql, userData);

        // Check if the user is a project manager
        if (newUser.isProjectManager === true) {
            // Execute the query to insert the user as a project manager
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
}



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

            // Check if the user is an admin or project manager
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
            console.log(logRows)
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
}


User.findByID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query the database to find the user by userId
        const [rows] = await conn.query("SELECT * FROM user WHERE userID = ?", userID);
        let userId = rows[0].userID
        // If the user is found, return it
        if (rows.length > 0) {
            let role;
            let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userID);

            if (rows[0].isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            // Create the user object
            const user = new User({
                userID: rows[0].userID,
                username: rows[0].userName,
                firstname: rows[0].firstName,
                lastname: rows[0].lastName,
                password: rows[0].passwordHash,
                email: rows[0].email,
            }, role, "");

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


User.updateByID = async (userData, result) => {

    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        for (let user of userData) {
            const { userID, username, firstname, lastname, email, password, isAdmin, isProjectManager } = user;

            // Update the user in the database
            await conn.query(
                `UPDATE user 
            SET 
                username = ?, 
                firstName = ?, 
                lastName = ?, 
                email = ?, 
                passwordHash = ?, 
                isAdmin = ? 
            WHERE 
                userID = ?;`,
                [username, firstname, lastname, email, password, isAdmin, userID]
            );

            if (user.isProjectManager === true) {
                // Überprüfen, ob der Benutzer bereits in der projectmanager-Tabelle vorhanden ist
                const [managerRows] = await conn.query("SELECT * FROM projectmanager WHERE userID = ?", user.userID);

                // Wenn der Benutzer nicht in der projectmanager-Tabelle gefunden wurde, fügen Sie ihn hinzu
                if (managerRows.length === 0) {
                    await conn.query("INSERT INTO projectmanager (userID) VALUES (?)", [user.userID]);
                    console.log("Der Benutzer wurde erfolgreich als Projektmanager hinzugefügt.");
                } else {
                    console.log("Der Benutzer ist bereits ein Projektmanager.");
                }
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

}

User.remove = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Delete user from activitylog table
        await conn.query("DELETE FROM activitylogProject WHERE userID = ?", userID);
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
}


User.checkIfEmailAlreadyUsed = async (email, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = "SELECT * FROM user WHERE email = ?";
        const [rows, fields] = await conn.query(query, email);
        conn.release();
        if (rows.length === 0) {
            result(null, { exist: false })
        } else {
            result(null, { exist: true })
        }
    } catch (err) {
        result(err, null);
    }
};

module.exports = {
    User
}
