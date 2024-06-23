const { connectionPool } = require("./db");


const Log = function (log, timeStamp, user) {
    this.logID = log.logID;
    this.projectID = log.projectID;
    this.userID = log.userID;
    this.activityDescription = log.activityDescription;
    this.activityName = log.activityName;
    this.timeStampLog = timeStamp;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
};

// Create a new Log entry
Log.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        let logProjectID = log.projectID;
        
        if(logProjectID === undefined || logProjectID === null) {
            logProjectID = null;
        }
        // Insert Log data into the database
        const insertLogSql = 'INSERT INTO Log (activityDescription, activityName, userID, projectID, timeStampLog) VALUES (?, ?, ?, ?, ?)';

        const logData = [
            log.activityDescription,
            log.activityName,
            log.userID,
            logProjectID,
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



Log.findLogsByProjectID = async (projectID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const queryProjectLog = `
            SELECT al.*, u.firstName, u.lastName
            FROM log al
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


// Find all Logs by User ID
Log.findLogsByUserID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const queryUserLog = `
            SELECT logID,
                    activityDescription,
                    activityName,
                    userID,
                    projectID,
                    timeStampLog
            FROM Log
            WHERE userID = ?

            ORDER BY timeStampLog DESC;
        `;

        // Query the database to find the user logs by userID
        const [logRows] = await conn.execute(queryUserLog, [userID]);
        const usersLog = [];

        // Get Name of the Log Create
        const [userRows] = await conn.execute("SELECT firstName, lastName FROM User WHERE userID = ?", [userID]);

        if (userRows.length > 0) {
            const user = userRows[0];
            // Process log data
            for (let logRow of logRows) {
                const log = {
                    logID: logRow.logID,
                    userID: logRow.userID,
                    activityName: logRow.activityName,
                    activityDescription: logRow.activityDescription,
                    timeStamp: logRow.timeStampLog,
                    firstName: user.firstName,
                    lastName: user.lastName
                };
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

Log.getUsersLastLogin = async (result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query to find the newest login date for all users
        const selectLastLoginSql = `
        SELECT 
            userID,
            MAX(timeStampLog) AS newestDate
        FROM 
            Log
        WHERE 
            activityName IN ('LOGIN', 'CREATE_USER')
        GROUP BY 
            userID;
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

module.exports = {
    Log
};