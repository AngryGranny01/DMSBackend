const { connectionPool } = require("./db");
const { Role } = require("./role");
const { sendOneTimeLink, generateToken } = require("../service/emailService");

const User = function (user, role) {
    this.userID = user.userID;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.orgUnit = user.orgUnit;
    this.role = role;
    this.isDeactivated = user.isDeactivated;
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
            orgUnit: userData.orgUnit,
            isAdmin: isAdmin,
        };

        const insertUserSql = `
            INSERT INTO user 
            (userName, firstName, lastName, email, orgUnit, isAdmin, passwordHash, salt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [rowsUser] = await conn.execute(insertUserSql, [
            user.userName,
            user.firstName,
            user.lastName,
            user.email,
            user.orgUnit,
            user.isAdmin,
            user.passwordHash,
            user.salt
        ]);

        // Generate token for email verification
        const token = generateToken(rowsUser.insertId);

        // Send email with one-time link
        await sendOneTimeLink(userData.email, token);

        // Insert the user as a project manager if applicable
        if (isProjectManager) {
            await conn.execute('INSERT INTO ProjectManager (userID) VALUES (?)', [rowsUser.insertId]);
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
        console.log("Im Called")
        // Query to get all users with their roles and deactivation status
        const query = `
            SELECT 
                p.id AS userID, 
                p.firstName, 
                p.lastName, 
                p.email, 
                po.orgUnit, 
                a.isDeactivated,
                GROUP_CONCAT(aur.userRole) AS roles
            FROM 
                Person p
            JOIN 
                Account a ON p.id = a.personId
            LEFT JOIN 
                Person_OrgUnit po ON p.id = po.personId
            LEFT JOIN 
                Account_UserRole aur ON a.id = aur.accountId
            GROUP BY 
                p.id, p.firstName, p.lastName, p.email, po.orgUnit, a.isDeactivated
        `;

        const [userRows] = await conn.execute(query);

        const users = userRows.map(userRow => {
            const roles = userRow.roles ? userRow.roles.split(',') : [];
            let role;
            console.log(userRow)
            if (roles.includes(Role.ADMIN)) {
                role = Role.ADMIN;
            } else if (roles.includes(Role.PROJECT_MANAGER)) {
                role = Role.PROJECT_MANAGER;
            } else {
                role = Role.USER;
            }

            return {
                userID: userRow.userID,
                firstName: userRow.firstName,
                lastName: userRow.lastName,
                email: userRow.email,
                orgUnit: userRow.orgUnit,
                role: role,
                isDeactivated: userRow.isDeactivated
            };
        });

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
            const [rows] = await conn.execute('SELECT passwordHash, salt FROM user WHERE userID = ?', [user.userID]);
            if (rows.length > 0) {
                passwordHash = rows[0].passwordHash;
                salt = rows[0].salt;
            } else {
                throw new Error('User not found');
            }
        }

        const isAdmin = user.role === Role.ADMIN;
        await conn.execute(
            `UPDATE user 
             SET userName = ?, firstName = ?, lastName = ?, email = ?, passwordHash = ?, salt = ?, isAdmin = ?, orgUnit = ?
             WHERE userID = ?`,
            [user.userName, user.firstName, user.lastName, user.email, passwordHash, salt, isAdmin, user.orgUnit, user.userID]
        );

        if (user.role === Role.PROJECT_MANAGER || isAdmin) {
            const [managerRows] = await conn.execute("SELECT * FROM projectmanager WHERE userID = ?", [user.userID]);
            if (managerRows.length === 0) {
                await conn.execute("INSERT INTO projectmanager (userID) VALUES (?)", [user.userID]);
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

        await conn.execute("DELETE FROM log WHERE userID = ?", [userID]);
        await conn.execute("DELETE FROM project_user WHERE userID = ?", [userID]);
        await conn.execute("DELETE FROM projectmanager WHERE userID = ?", [userID]);
        const [userDeleteResult] = await conn.execute("DELETE FROM user WHERE userID = ?", [userID]);

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
        const [rows] = await conn.execute("SELECT * FROM user WHERE email = ?", [email]);
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
        const [rows] = await conn.execute("SELECT passwordHash, userID FROM user WHERE email = ?", [email]);
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
        const [rows] = await conn.execute("SELECT * FROM user WHERE userID = ?", [userID]);

        if (rows.length > 0) {
            const userData = rows[0];
            const [managerRows] = await conn.execute("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", [userData.userID]);

            const role = userData.isAdmin === 1 ? Role.ADMIN :
                managerRows[0].isProjectManager === 1 ? Role.PROJECT_MANAGER : Role.USER;

            const user = {
                userID: userData.userID,
                userName: userData.userName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                orgUnit: userData.orgUnit,
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
        const [res] = await conn.execute('SELECT passwordHash FROM user WHERE userID = ?', [userID]);

        if (res[0].passwordHash === "") {
            await conn.beginTransaction();
            await conn.execute(`UPDATE user SET passwordHash = ?, salt = ? WHERE userID = ?`, [passwordHash, salt, userID]);
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
        const query = `
            SELECT p.firstName, p.lastName, p.email, a.id as accountId, a.isDeactivated, 
                po.orgUnit, GROUP_CONCAT(aur.userRole) as roles, pw.hash as passwordHash
            FROM Person p
            JOIN Account a ON p.id = a.personId
            LEFT JOIN Person_OrgUnit po ON p.id = po.personId
            LEFT JOIN Account_UserRole aur ON a.id = aur.accountId
            LEFT JOIN Password pw ON a.id = pw.accountId
            WHERE p.email = ?
            GROUP BY p.firstName, p.lastName, p.email, a.id, a.isDeactivated, po.orgUnit, pw.hash`;
        const [rows] = await conn.execute(query, [email]);

        if (rows.length === 0) {
            return null;
        }

        const userData = rows[0];

        const roles = userData.roles ? userData.roles.split(',') : [];
        const role = roles.includes(Role.ADMIN) ? Role.ADMIN : roles.includes(Role.PROJECT_MANAGER) ? Role.PROJECT_MANAGER : Role.USER;

        const user = {
            userID: userData.accountId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            orgUnit: userData.orgUnit,
            role: role,
            isDeactivated: userData.isDeactivated,
            passwordHash: userData.passwordHash,
        };
        console.log(user)
        return user;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.isProjectManager = async (userID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const query = 'SELECT COUNT(*) AS count FROM projectmanager WHERE userID = ?';
        const [rows] = await conn.execute(query, [userID]);
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
        const query = `
            SELECT pw.salt
            FROM Person p
            JOIN Account a ON p.id = a.personId
            JOIN Password pw ON a.id = pw.accountId
            WHERE p.email = ?`;
        const [rows] = await conn.execute(query, [email]);

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
