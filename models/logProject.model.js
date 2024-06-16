const { connectionPool } = require("./db");

const LogProject = function (log, timeStamp, user) {
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
LogProject.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        console.log(log)
        // Insert Log data into the database
        const insertLogSql = 'INSERT INTO ActivityLog (activityDescription, activityName, userID, projectID, timeStampLog) VALUES (?, ?, ?, ?, ?)';

        const logData = [
            log.activityDescription,
            log.activityName,
            log.userID,
            log.projectID,
            new Date()
        ];
        await conn.execute(insertLogSql, logData);

        await conn.commit();
        result(null, null);
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

LogProject.findProjectLogsByID = async (projectID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const queryProjectLog = `
            SELECT al.*, u.firstName, u.lastName
            FROM ActivityLog al
            JOIN User u ON al.userID = u.userID
            WHERE al.projectID = ?
        `;

        // Query the database to find the project logs by projectID
        const [logRows] = await conn.execute(queryProjectLog, [projectID]);
        const projectLogs = [];

        // Process each log row and create log objects
        for (let logRow of logRows) {
            const log = {
                logUserID: logRow.logID,
                projectID: logRow.projectID,
                userID: logRow.userID,
                activityName: logRow.activityName,
                activityDescription: logRow.activityDescription,
                timeStamp: logRow.timeStampLog,
                firstName: logRow.firstName,
                lastName: logRow.lastName
            };
            projectLogs.push(log);
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

module.exports = {
    LogProject
};