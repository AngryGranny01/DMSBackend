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
        console.log("Log entry")
        console.log("Log entry: " + log)
        // Insert Log data into the database
        const insertLogSql = 'INSERT INTO activityLog SET ?';

        const logData = {
            activityDescription: log.description,
            activityName: log.activityName,
            userID: log.userID,
            projectID: log.projectID,
            timeStampLog: new Date()
        };
        await conn.query(insertLogSql, logData);

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

LogProject.findProjectLogsByID = async (projectID, userID, result) => {
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
            let [userRows] = await conn.query("Select firstName, lastName from User where userID = ?", logRows[0].userID);

            if (userRows.length > 0) {
                let user = userRows[0];
                // Process each log row

                for (let logRow of logRows) {
                    const log = {
                        logUserID: logRow.logID,
                        projectID: logRow.projectID,
                        userID: logRow.userID,
                        activityName: logRow.activityName,
                        activityDescription: logRow.activityDescription,
                        timeStamp: logRow.timeStampLog,
                        firstName: user.firstName,
                        lastName: user.lastName
                    };
                    projectLogs.push(log);
                }
            } else {
                // Handle case where user is not found
                console.error(`Project Log with userID ${userID} not found.`);
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

module.exports = {
    LogProject
};