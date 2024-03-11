const { connectionPool } = require("./db");
const { convertTimeStampToDateTime } = require("./convertDateTime")

const Log = function (log, timeStamp) {
    this.logID = log.logID;
    this.projectID = log.projectID;
    this.userID = log.userID;
    this.activityDescription = log.activityDescription;
    this.activityName = log.activityName;
    this.timeStamp = timeStamp;
};

//TODO: find all Logs for Project and Create
Log.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        //add to Logs
        const insertLogSql = 'INSERT INTO activityLog SET ?'
        const logData = {
            activityDescription: log.activityDescription,
            activityName: log.activityName,
            userID: log.userID,
            projectID: log.projectID,
            timeStampLog: new Date()
        }
        console.log(logData)
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
}

//only project Logs
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
        // If the user logs are found, return them
        if (logRows.length > 0) {
            for (let logRow of logRows) {
                let date = convertTimeStampToDateTime(logRow.timeStampLog)
                // Create project Log object with last login date
                const log = new Log({
                    logID: logRow.logProjectID,
                    userID: logRow.userID,
                    projectID: logRow.projectID,
                    activityName: logRow.activityName,
                    activityDescription: logRow.activityDescription,
                }, date);
                projectLogs.push(log)
            }
        }
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

//Logs from Project and User together under userID
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
        // If the user logs are found, process and return them
        if (logRows.length > 0) {
            for (let logRow of logRows) {
                // Convert timestamp to DateTime object
                let dateTime = convertTimeStampToDateTime(logRow.timeStamp);

                // Create a log object and push it to the usersLog array
                const log = new Log({
                    logUserID: logRow.logID,
                    projectID: logRow.projectID,
                    userID: logRow.userID,
                    activityName: logRow.activityName,
                    activityDescription: logRow.activityDescription,
                }, dateTime);
                usersLog.push(log);
            }
        }
        result(null, usersLog); // Return the user logs
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
}