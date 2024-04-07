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

LogUser.getUsersLastLogin = async (result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
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
}

LogUser.getUserLastLogin = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        // Query to find the newest login date for a specific user
        const selectLastLoginSql = `
        SELECT 
            MAX(timeStampUser) AS newestDate
        FROM 
            ActivityLogUser
        WHERE 
            userID = ? 
            AND activityName IN ('LOGIN', 'CREATE_USER')
        GROUP BY 
            userID;
        `;

        const [dateRows] = await conn.query(selectLastLoginSql, [userID]);
        
        // Check if any date is found
        if (dateRows.length > 0) {
            const lastLoginDate = dateRows[0].newestDate;
            result(null, {userID: userID, lastLoginDate: lastLoginDate });
        } else {
            // If no date found for the user
            result({ message: "No login date found for the user." }, null);
        }
    } catch (error) {
        console.error("Error occurred while fetching user's last login date: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}




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

module.exports = {
    LogUser
};