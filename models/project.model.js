const { connectionPool } = require("./db");
const { NiceDate } = require("../models/dateTime");

const Project = function (project, time) {
    this.projectID = project.projectID;
    this.projectName = project.projectName;
    this.projectDescription = project.projectName;
    this.key = project.key;
    this.dateTime = dateTime;
};

Project.create = async (newProject, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows, fields] = await conn.query("INSERT INTO", newSchedule)
        result(null, { id: rows.insertId })
    } catch (error) {
        console.error("Error occurred while inserting a new Project: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

Project.getAllWithKey = async (key, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows, fields] = await conn.query("SELECT From project where key = ?", newSchedule)

        const projects = rows.map(row => {
            const dateTime = DateTime.convertToJson(row.dateTime);
            return {
                projectId: row.projectID,
                projectName: row.projectName,
                projectDescription: row.projectDescription,
                dateTime: dateTime
            }
        })

        result(null, projects)
    } catch (error) {
        console.error("Error occurred while getting the specific schedules: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

Project.remove = async (projectId, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const [rows, fields] = await conn.query("DELETE FROM project WHERE projectID = ?", projectId);
        result(null, rows.affectedRows);
    } catch (error) {
        console.error("Error occurred while deleting the project: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}


module.exports = {
    Project
}