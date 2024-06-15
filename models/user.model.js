const { connectionPool } = require("./db");
const { Role } = require("./role");
const { sendOneTimeLink, generateToken } = require("../service/emailService");

const User = function (user, role) {
    this.userID = user.userID;
    this.userName = user.userName;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.salt = user.salt;
    this.orgEinheit = user.orgEinheit;
    this.role = role;
};

User.create = async (userData) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        let isAdmin = userData.role === Role.ADMIN;
        let isProjectManager = userData.role === Role.PROJECT_MANAGER || isAdmin;

        const user = {
            userName: userData.userName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            orgEinheit: userData.orgEinheit,
            isAdmin: isAdmin,
            passwordHash: "",
            salt: ""
        };

        const insertUserSql = 'INSERT INTO user SET ?';
        const [rowsUser] = await conn.query(insertUserSql, user);

        // Generate token for email verification
        const token = generateToken(rowsUser.insertId);

        // Send email with one-time link
        await sendOneTimeLink(userData.email, token);

        // Insert the user as a project manager if applicable
        if (isProjectManager) {
            await conn.query('INSERT INTO ProjectManager (userID) VALUES (?)', [rowsUser.insertId]);
        }

        await conn.commit();
        return rowsUser.insertId;
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new User: ", error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to retrieve all users
User.getAll = async (response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [userRows] = await conn.query("SELECT * FROM user");

        const users = [];
        for (const userRow of userRows) {
            let role;
            const [managerRows] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userRow.userID);
            if (userRow.isAdmin === 1) {
                role = Role.ADMIN;
            } else if (managerRows[0].isProjectManager === 1) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }
            users.push({
                userID: userRow.userID,
                userName: userRow.userName,
                firstName: userRow.firstName,
                lastName: userRow.lastName,
                email: userRow.email,
                salt: userRow.salt,
                orgEinheit: userRow.orgEinheit,
                passwordHash: userRow.passwordHash,
                role: role
            });
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

// Function to update a user by ID
User.updateByID = async (user, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        let { passwordHash, salt } = user;
        if (!passwordHash) {
            const [rows] = await conn.query('SELECT passwordHash, salt FROM user WHERE userID = ?', [user.userID]);
            if (rows.length > 0) {
                passwordHash = rows[0].passwordHash;
                salt = rows[0].salt;
            } else {
                throw new Error('User not found');
            }
        }

        const isAdmin = user.role === Role.ADMIN;
        await conn.query(
            `UPDATE user 
             SET userName = ?, firstName = ?, lastName = ?, email = ?, passwordHash = ?, salt = ?, isAdmin = ?, orgEinheit = ?
             WHERE userID = ?`,
            [user.userName, user.firstName, user.lastName, user.email, passwordHash, salt, isAdmin, user.orgEinheit, user.userID]
        );

        if (user.role === Role.PROJECT_MANAGER || isAdmin) {
            const [managerRows] = await conn.query("SELECT * FROM projectmanager WHERE userID = ?", user.userID);
            if (managerRows.length === 0) {
                await conn.query("INSERT INTO projectmanager (userID) VALUES (?)", [user.userID]);
            }
        }

        await conn.commit();
        response(null, "Users updated successfully");
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while updating users: ", error);
        response({ message: "Error occurred while updating users" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to delete a user by ID
User.remove = async (userID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        await conn.query("DELETE FROM activitylog WHERE userID = ?", userID);
        await conn.query("DELETE FROM activitylogUser WHERE userID = ?", userID);
        await conn.query("DELETE FROM project_user WHERE userID = ?", userID);
        await conn.query("DELETE FROM projectmanager WHERE userID = ?", userID);
        const [userDeleteResult] = await conn.query("DELETE FROM user WHERE userID = ?", userID);

        await conn.commit();
        response(null, userDeleteResult.affectedRows);
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while deleting the user: ", error);
        response({ message: "Error occurred while deleting the user" }, null);
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
        conn = await connectionPool.promise().getConnection();
        const [rows] = await conn.query("SELECT * FROM user WHERE email = ?", email);
        response(null, { exist: rows.length > 0 });
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to check if username already exists
User.isUsernameAlreadyUsed = async (username, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows] = await conn.query("SELECT * FROM user WHERE userName = ?", username);
        response(null, { exist: rows.length > 0 });
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to check password
User.checkPassword = async (email, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows] = await conn.query("SELECT passwordHash, userID FROM user WHERE email = ?", email);
        response(null, rows.length === 0 ? null : { passwordHash: rows[0].passwordHash, userID: rows[0].userID });
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to find user by ID
User.findByID = async (userID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows] = await conn.query("SELECT * FROM user WHERE userID = ?", userID);

        if (rows.length > 0) {
            const userData = rows[0];
            const [managerRows] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userData.userID);

            const role = userData.isAdmin === 1 ? Role.ADMIN :
                managerRows[0].isProjectManager === 1 ? Role.PROJECT_MANAGER : Role.USER;

            const user = {
                userID: userData.userID,
                userName: userData.userName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                orgEinheit: userData.orgEinheit,
                role: role
            };

            response(null, user);
        } else {
            response({ message: `User with ID ${userID} not found` }, null);
        }
    } catch (err) {
        response(err, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to update password
User.updatePassword = async (userID, passwordHash, salt, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [res] = await conn.query('SELECT passwordHash FROM user WHERE userID = ?', [userID]);

        if (res[0].passwordHash === "") {
            await conn.beginTransaction();
            await conn.query(`UPDATE user SET passwordHash = ?, salt = ? WHERE userID = ?`, [passwordHash, salt, userID]);
            await conn.commit();
            response(null, `User with ID ${userID} updated successfully`);
        } else {
            const errorMessage = "The user password has already been updated.";
            console.error(errorMessage);
            response(errorMessage, null);
        }
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while updating users: ", error);
        response(`Error updating user with ID ${userID}`, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to find user by email
User.findByEmail = async (email) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = 'SELECT * FROM user WHERE email = ?';
        const [rows] = await conn.query(query, [email]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.findRole = async (userID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = 'SELECT COUNT(*) AS count FROM projectmanager WHERE userID = ?';
        const [rows] = await conn.query(query, [userID]);
        return rows[0].count > 0;
    } catch (error) {
        console.error('Error checking if user is project manager:', error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


User.findSaltByEmail = async (email) => {
    let conn;
    try {
      conn = await connectionPool.promise().getConnection();
      const [rows] = await conn.query('SELECT salt FROM User WHERE email = ?', [email]);
      if (rows.length === 0) {
        throw new Error('No user found with this email');
      }
      return rows[0].salt;
    } catch (error) {
      console.error('Error fetching salt:', error);
      throw error;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  };
module.exports = { User };
