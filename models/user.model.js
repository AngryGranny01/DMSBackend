const { connectionPool } = require("./db");
const { Role } = require("./role");
const { findNewestDate } = require('./convertDateTime');

// User class definition
class User {
    constructor(user, role, lastLogin) {
        this.userID = user.userID;
        this.userName = user.username;
        this.firstName = user.firstname;
        this.lastName = user.lastname;
        this.email = user.email;
        this.passwordHash = user.password;
        this.role = role;
        this.lastLogin = lastLogin;
    }

    // Method to create a new user
    static async create(newUser, result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();
            await conn.beginTransaction();

            const insertUserSql = 'INSERT INTO user SET ?';
            const userData = {
                userName: newUser.username,
                firstName: newUser.firstname,
                lastName: newUser.lastname,
                email: newUser.email,
                passwordHash: newUser.password,
                isAdmin: newUser.isAdmin,
            };

            // Insert user into the database
            const [rowsUser, fieldsUser] = await conn.query(insertUserSql, userData);

            // Check if the user is a project manager and insert into ProjectManager table
            if (newUser.isProjectManager === true) {
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

    // Method to retrieve all users with their last login date
    static async getAllUsersWithLastLoginDate(result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();

            const [userRows] = await conn.query("SELECT * FROM user");

            const usersWithLastLogin = [];

            for (const userRow of userRows) {
                let role;

                // Check the role of the user
                let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userRow.userID);
                if (userRow.isAdmin === 1) {
                    role = Role.ADMIN;
                } else if (managerRows[0].isProjectManager === 1) {
                    role = Role.PROJECT_MANAGER;
                } else {
                    role = Role.USER;
                }

                // Query the last login date for the user
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

    // Method to find user by ID
    static async findByID(userID, result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();

            const [rows,] = await conn.query('SELECT * FROM user WHERE userID = ?', [userID]);

            if (rows.length > 0) {
                let userData = rows[0]
                let role;
                let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userID);

                if (userData.isAdmin === 1) {
                    role = Role.ADMIN;
                } else if (managerRows[0].isProjectManager === 1) {
                    role = Role.PROJECT_MANAGER;
                } else {
                    role = Role.USER;
                }

                const user = new User({
                    userID: userData.userID,
                    username: userData.userName,
                    firstname: userData.firstName,
                    lastname: userData.lastName,
                    email: userData.email,
                    password: userData.passwordHash,
                }, role, "");

                result(null, user);
            } else {
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
    }

    // Method to update user by ID
    static async updateByID(userData, result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();
            await conn.beginTransaction();

            for (let user of userData) {
                const { userID, username, firstname, lastname, email, password, isAdmin } = user;

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
                    const [managerRows] = await conn.query("SELECT * FROM projectmanager WHERE userID = ?", user.userID);

                    if (managerRows.length === 0) {
                        await conn.query("INSERT INTO projectmanager (userID) VALUES (?)", [user.userID]);
                        console.log("User successfully added as a project manager.");
                    } else {
                        console.log("User is already a project manager.");
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

    // Method to remove user by ID
    static async remove(userID, result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();
            await conn.beginTransaction();

            await conn.query("DELETE FROM activitylogProject WHERE userID = ?", userID);
            await conn.query("DELETE FROM activitylogUser WHERE userID = ?", userID);
            await conn.query("DELETE FROM project_user WHERE userID = ?", userID);
            await conn.query("DELETE FROM projectmanager WHERE userID = ?", userID);

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

    // Method to check if email is already used
    static async checkIfEmailAlreadyUsed(email, result) {
        let conn;
        try {
            conn = await connectionPool.promise().getConnection();
            const query = "SELECT * FROM user WHERE email = ?";
            const [rows, fields] = await conn.query(query, email);
            conn.release();
            if (rows.length === 0) {
                result(null, { exist: false });
            } else {
                result(null, { exist: true });
            }
        } catch (err) {
            result(err, null);
        }
    }
}

module.exports = {
    User
};
