const { connectionPool } = require("./db");
const { ActivityName } = require('./activityName');
const crypto = require("../utils/crypto");
const { STANDARD_PRIVATE_KEY } = require("../constants/env");

const LogUser = function (log, timeStamp, user) {
    this.logUserID = log.logUserID;
    this.userID = log.userID;
    this.activityDescription = log.activityDescription;
    this.activityName = log.activityName;
    this.timeStamp = timeStamp;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
};


// Create a new LogUser entry
LogUser.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        let decryptedActDesc = crypto.decryptRSA(log.activityDescription, STANDARD_PRIVATE_KEY)
        let decryptedActName = crypto.decryptRSA(log.activityName, STANDARD_PRIVATE_KEY)
        let decrypteduserID = crypto.decryptRSA(log.userID, STANDARD_PRIVATE_KEY)

        // Insert LogUser data into the database
        const insertLogSql = 'INSERT INTO activityLogUser SET ?';
        const logData = {
            activityDescription: decryptedActDesc,
            activityName: decryptedActName,
            userID: decrypteduserID,
            timeStampUser: new Date()
        };
        const [rowsLog, fieldsUser] = await conn.query(insertLogSql, logData);

        await conn.commit();
        result(null, { id: rowsLog.insertId });
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new User Log Entry: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Find all Logs by User ID
LogUser.findByID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        //encrypt Data with public key of sender
        const [publicKeySender] = await conn.query("Select publicKey from User WHERE userID=?", userID)

        const queryUserLog = `
            SELECT logUserID AS logID,
                    activityDescription,
                    activityName,
                    userID,
                    NULL AS projectID, -- Add NULL value to match the number of columns
                    timeStampUser AS timeStamp
            FROM ActivityLogUser
            WHERE userID = ?

            UNION

            SELECT logID,
                    activityDescription,
                    activityName,
                    userID,
                    projectID,
                    timeStampLog AS timeStamp
            FROM ActivityLog
            WHERE userID = ?

            ORDER BY timeStamp DESC;`;

        // Query the database to find the user logs by userID
        const [logRows] = await conn.query(queryUserLog, [userID, userID]);
        const usersLog = [];

        // Get Name of the Log Create
        let [userRows] = await conn.query("Select firstName, lastName from User where userID = ?", userID);

        if (userRows.length > 0) {
            let user = userRows[0];
            const publicKey = publicKeySender[0].publicKey
            // Process log data
            for (let logRow of logRows) {
                const log = {
                    logID: crypto.encryptRSA(logRow.logID, publicKey),
                    userID: crypto.encryptRSA(logRow.userID, publicKey),
                    activityName: crypto.encryptRSA(logRow.activityName, publicKey),
                    activityDescription: crypto.encryptRSA(logRow.activityDescription, publicKey),
                    timeStamp: crypto.encryptRSA(logRow.timeStamp, publicKey),
                    firstName: crypto.encryptRSA(user.firstName, publicKey),
                    lastName: crypto.encryptRSA(user.lastName, publicKey)
                }
                usersLog.push(log);
            }
        } else {
            // Handle case where user is not found
            console.error(`User with userID ${userID} not found.`);
        }
        result(null, usersLog);
    } catch (error) {
        console.error("Error retrieving User Logs from database:", error);
        result({ message: "Error retrieving User Logs from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


LogUser.getUsersLastLogin = async (senderUserID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        //encrypt Data with public key of sender
        const [publicKeySender] = await conn.query("Select publicKey from User WHERE userID=?", senderUserID)

        // Query to find the newest login date for all users
        const selectLastLoginSql = `
        SELECT 
            userID,
            MAX(timeStampUser) AS newestDate
        FROM 
            ActivityLogUser
        WHERE 
            activityName IN ('LOGIN', 'CREATE_USER')
        GROUP BY 
            userID;
        `;

        const [dateRows] = await conn.query(selectLastLoginSql);
        const lastLoginDates = dateRows.map(dateRow => ({
            date: crypto.encryptRSA(dateRow.newestDate, publicKeySender[0].publicKey),
            userID: crypto.encryptRSA(dateRow.userID, publicKeySender[0].publicKey)
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
}

module.exports = {
    LogUser
};