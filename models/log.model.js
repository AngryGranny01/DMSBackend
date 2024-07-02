const { connectionPool } = require("./db");
const { TargetEnum } = require("./targetEnum");

const Log = function (log, timeStamp, user) {
    this.id = log.id;
    this.actorId = log.actorId;
    this.action = log.action;
    this.target = log.target;
    this.targetId = log.targetId;
    this.field = log.field;
    this.value = log.value;
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

        const insertLogSql = `
            INSERT INTO Log (actorId, action, target, targetId, field, value, timeStampLog) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const logData = [
            log.actorId,
            log.action,
            log.target,
            log.targetId,
            log.field,
            log.value,
            new Date()
        ];

        await conn.execute(insertLogSql, logData);
        await conn.commit();
        result(null, null);
    } catch (error) {
        if (conn) await conn.rollback();
        console.error("Error occurred while inserting a new Log Entry: ", error);
        result(error, null);
    } finally {
        if (conn) conn.release();
    }
};


// Find all Logs by projectID
Log.findLogsByProjectID = async (projectID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const queryProjectLog = `
            SELECT l.*, p.firstName, p.lastName
            FROM Log l
            JOIN Account a ON l.actorId = a.id
            JOIN Person p ON a.personId = p.id
            WHERE l.target = ? AND l.targetId = ?
        `;

        const [logRows] = await conn.execute(queryProjectLog, [TargetEnum.PROJECT, projectID]);
        const projectLogs = logRows.map(logRow => ({
            id: logRow.id,
            actorId: logRow.actorId,
            action: logRow.action,
            target: logRow.target,
            targetId: logRow.targetId,
            field: logRow.field,
            value: logRow.value,
            timeStamp: logRow.timeStampLog,
            firstName: logRow.firstName,
            lastName: logRow.lastName
        }));

        result(null, projectLogs);
    } catch (error) {
        console.error("Error retrieving Project Logs from database:", error);
        result({ message: "Error retrieving Project Logs from database" }, null);
    } finally {
        if (conn) conn.release();
    }
};

// Find all Logs by User ID
Log.findLogsByUserID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const queryUserLog = `
            SELECT l.*, p.firstName, p.lastName
            FROM Log l
            JOIN Account a ON l.actorId = a.id
            JOIN Person p ON a.personId = p.id
            WHERE l.actorId = ?
            ORDER BY l.timeStampLog DESC;
        `;

        const [logRows] = await conn.execute(queryUserLog, [userID]);
        const usersLog = logRows.map(logRow => ({
            id: logRow.id,
            actorId: logRow.actorId,
            action: logRow.action,
            target: logRow.target,
            targetId: logRow.targetId,
            field: logRow.field,
            value: logRow.value,
            timeStamp: logRow.timeStampLog,
            firstName: logRow.firstName,
            lastName: logRow.lastName
        }));

        result(null, usersLog);
    } catch (error) {
        console.error("Error retrieving User Logs from database:", error);
        result({ message: "Error retrieving User Logs from database" }, null);
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    Log
};