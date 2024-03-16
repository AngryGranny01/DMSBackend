const { connectionPool } = require("./db");
const { convertTimeStampToDateTime } = require("./convertDateTime");

const Log = function (log, timeStamp, user) {
    this.logID = log.logID;
    this.projectID = log.projectID;
    this.userID = log.userID;
    this.activityDescription = log.activityDescription;
    this.activityName = log.activityName;
    this.timeStamp = timeStamp;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
};

// Create a new Log entry
Log.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Insert Log data into the database
        const insertLogSql = 'INSERT INTO activityLog SET ?';
        const logData = {
            activityDescription: log.activityDescription,
            activityName: log.activityName,
            userID: log.userID,
            projectID: log.projectID,
            timeStampLog: new Date()
        };
        const [rowsLog, fieldsUser] = await conn.query(insertLogSql, logData);

        await conn.commit();
        result(null, { id: rowsLog.insertId });
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new Log Entry: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

Log.findProjectLogsByID = async (projectID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const queryProjectLog = `
            SELECT * 
            FROM ActivityLog
            WHERE projectID = ?
        `;

        // Query the database to find the project logs by projectID
        const [logRows] = await conn.query(queryProjectLog, projectID);
        const projectLogs = [];

        // Check if any logs are found
        if (logRows.length > 0) {

            // Get Name of the Log Create
            let [userRows] = await conn.query("Select firstName, lastName from User where userID = ?", userID);

            if (userRows.length > 0) {
                let user = userRows[0];
                // Process each log row

                for (let logRow of logRows) {
                    let timeStamp = convertTimeStampToDateTime(logRow.timeStampLog);

                    const log = {
                        logUserID: logRow.logID,
                        projectID: logRow.projectID,
                        userID: logRow.userID,
                        activityName: logRow.activityName,
                        activityDescription: logRow.activityDescription,
                        timeStamp: timeStamp,
                        firstName: user.firstName,
                        lastName: user.lastName
                    };
                    projectLogs.push(log);
                }
            } else {
                // Handle case where user is not found
                console.error(`User with userID ${logRow.userID} not found.`);
            }
        }
        
        // Return projectLogs after processing all logs
        result(null, projectLogs);
    } catch (error) {
        console.error("Error retrieving Project Logs from database:", error);
        result({ message: "Error retrieving Project Logs from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Find all Logs by User ID
Log.findByID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
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

            // Process log data
            for (let logRow of logRows) {
                let timeStamp = convertTimeStampToDateTime(logRow.timeStamp);

                const log = {
                    logUserID: logRow.logID,
                    projectID: logRow.projectID,
                    userID: logRow.userID,
                    activityName: logRow.activityName,
                    activityDescription: logRow.activityDescription,
                    timeStamp: timeStamp,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
                usersLog.push(log);
            }
        } else {
            // Handle case where user is not found
            console.error(`User with userID ${logRow.userID} not found.`);
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

module.exports = {
    Log
};