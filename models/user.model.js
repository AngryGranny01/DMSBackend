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

        // Insert into Person table
        const insertPersonSql = `
            INSERT INTO Person (firstName, lastName, email) 
            VALUES (?, ?, ?)`;
        const [rowsPerson] = await conn.execute(insertPersonSql, [
            userData.firstName,
            userData.lastName,
            userData.email
        ]);

        const personID = rowsPerson.insertId;

        // Insert into Account table
        const insertAccountSql = `
            INSERT INTO Account (personId, isDeactivated) 
            VALUES (?, ?)`;
        const [rowsAccount] = await conn.execute(insertAccountSql, [
            personID,
            true
        ]);

        const accountID = rowsAccount.insertId;

        // Insert into Person_OrgUnit table
        const insertOrgUnitSql = `
            INSERT INTO Person_OrgUnit (personId, orgUnit) 
            VALUES (?, ?)`;
        await conn.execute(insertOrgUnitSql, [
            personID,
            userData.orgUnit
        ]);

        // Insert into Account_UserRole table
        const insertUserRoleSql = `
            INSERT INTO Account_UserRole (accountId, userRole) 
            VALUES (?, ?)`;
        await conn.execute(insertUserRoleSql, [
            accountID,
            userData.role
        ]);

        // Generate token for email verification
        const token = generateToken(accountID);

        // Send email with one-time link
        await sendOneTimeLink(userData.email, token);

        await conn.commit();
        return accountID;
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
        // Query to get all users with their roles and deactivation status
        const query = `
            SELECT 
                a.id AS userID, 
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
        console.log(user)

        // Find personID from accountID
        const [accountRows] = await conn.execute('SELECT personId FROM Account WHERE id = ?', [user.accountID]);
        if (accountRows.length === 0) {
            throw new Error('Account not found');
        }
        const personID = accountRows[0].personId;

        // Update Person table
        await conn.execute(
            `UPDATE Person 
             SET firstName = ?, lastName = ?, email = ? 
             WHERE id = ?`,
            [user.firstName, user.lastName, user.email, personID]
        );

        // Update Account table
        await conn.execute(
            `UPDATE Account 
             SET isDeactivated = ? 
             WHERE personId = ?`,
            [user.isDeactivated, personID]
        );

        // Update OrgUnit association
        await conn.execute(
            `UPDATE Person_OrgUnit 
             SET orgUnit = ? 
             WHERE personId = ?`,
            [user.orgUnit, personID]
        );

        // Update user role
        if (user.role) {
            await conn.execute(
                `DELETE FROM Account_UserRole WHERE accountId = ?`,
                [user.accountID]
            );
            await conn.execute(
                `INSERT INTO Account_UserRole (accountId, userRole) VALUES (?, ?)`,
                [user.accountID, user.role]
            );
        }

        await conn.commit();
        response(null, "User updated successfully");
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while updating user: ", error);
        response({ message: "Error occurred while updating user" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.createPassword = async (accountID, passwordHash, salt, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Insert the password hash and salt into the Password table
        await conn.execute(
            `INSERT INTO Password (accountId, hash, salt) VALUES (?, ?, ?)`,
            [accountID, passwordHash, salt]
        );
        //find role associated with accountID
        const [rows] = await conn.execute(
            `SELECT userRole FROM Account_UserRole WHERE accountId = ?`,
            [accountID]
        );
        if (rows.length === 0) {
            throw new Error(`No role found for account ID ${accountID}`);
        }

        const role = rows[0].userRole;
        await conn.commit();
        response(null, { role });

    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while creating password and updating account status: ", error);
        response(`Error creating password and updating account status for account ID ${accountID}`, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

User.hasPassword = async (accountID, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows] = await conn.execute('SELECT hash FROM Password WHERE accountId = ?', [accountID]);
        if (rows.length > 0) {
            response(null, true);
        } else {
            response(null, false); // No password found
        }
    } catch (error) {
        console.error('Error occurred while retrieving password:', error);
        response(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// Function to update password 
User.updatePassword = async (accountID, passwordHash, salt, response) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Update the password
        await conn.execute(`UPDATE Password SET hash = ?, salt = ? WHERE accountId = ?`, [passwordHash, salt, accountID]);

        await conn.commit();
        response(null, `Password and account status updated successfully`);

    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while updating password and account status: ", error);
        response(`Error updating password and account status for account ID ${accountID}`, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


User.deactivateAccount = async (accountID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [result] = await conn.execute(
            `UPDATE Account SET isDeactivated = true WHERE id = ?`,
            [accountID]
        );
        return result;
    } catch (error) {
        console.error("Error occurred while deactivating account: ", error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Method to get last login date for active users
User.getUsersLastLogin = async (result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query to find the newest login date for all active users
        const selectLastLoginSql = `
        SELECT 
            l.actorId AS userID,
            MAX(l.timeStampLog) AS newestDate
        FROM 
            Log l
            JOIN Account a ON l.actorId = a.id
        WHERE 
            l.action = 'login'
        GROUP BY 
            l.actorId;
        `;

        const [dateRows] = await conn.execute(selectLastLoginSql);
        const lastLoginDates = dateRows.map(dateRow => ({
            date: dateRow.newestDate,
            userID: dateRow.userID
        }));

        result(null, lastLoginDates);
    } catch (error) {
        console.error("Error occurred while fetching users' last login dates: ", error);
        result(error, null);
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
        const [rows] = await conn.execute("SELECT * FROM Person WHERE email = ?", [email]);
        console.log(rows.length > 0)
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
        console.log(rows[0])
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
