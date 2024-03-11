const { convertTimeStampToDateTime } = require("./convertDateTime");
const { connectionPool } = require("./db");

const LogUser = function (log, timeStamp) {
    this.logUserID = log.logUserID;
    this.activityDescription = log.activityDescription;
    this.activityName = log.activityName;
    this.timeStamp = timeStamp;
};

LogUser.create = async (log, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        //add to Logs
        const insertLogSql = 'INSERT INTO activityLogUser SET ?'
        const logData = {
            activityDescription: log.activityDescription,
            activityName: log.activityName,
            userID: log.userID,
            timeStampUser: new Date()
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

LogUser.findByID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const queryUserLog = `
        SELECT logUserID AS logID,
                activityDescription,
                activityName,
                timeStampUser AS timeStamp
        FROM ActivityLogUser
        WHERE userID = ?

        UNION
        
        SELECT logProjectID AS logID,
                activityDescription,
                activityName,
                timeStampProject AS timeStamp
        FROM ActivityLogProject
        WHERE userID = ?
        
        ORDER BY timeStamp DESC;`;

        // Query the database to find the user logs by userID
        const [logRows] = await conn.query(queryUserLog, [userID, userID]);
        const usersLog = [];
        // If the user logs are found, return them
        if (logRows.length > 0) {
            for (let logRow of logRows) {
                let date = convertTimeStampToDateTime(logRow.timeStamp)
                // Create user object with last login date
                const log = new LogUser({
                    logUserID: logRow.logID,
                    activityName: logRow.activityName,
                    activityDescription: logRow.activityDescription,
                }, date);
                usersLog.push(log)
            }
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
    LogUser
}