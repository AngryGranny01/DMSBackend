const { convertTimeStampToDateTime } = require("./convertDateTime");
const { connectionPool } = require("./db");

const LogUser = function (log, timeStamp) {
    this.logUserID = log.logUserID;
    this.userID = log.userID;
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
        console.error("Error occurred while inserting a new User Log Entry: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}


module.exports = {
    LogUser
}