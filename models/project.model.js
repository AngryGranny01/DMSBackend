const { connectionPool } = require("./db");
const { Role } = require("./role");
const crypto = require('../utils/crypto');

const Project = function (project, dateTime) {
    this.projectID = project.projectID;
    this.projectName = project.projectName;
    this.projectDescription = project.projectDescription;
    this.key = project.key;
    this.dateTime = dateTime;
};

// Define functions to interact with database

// Function to create a new project
Project.create = async (newProject, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        const insertProjectSql = 'INSERT INTO Project SET ?'

        let projectKey = newProject.projectKey
        let managerID = newProject.managerID //crypto.decryptUsingAES256
        let decryptedDescription = newProject.projectDescription //crypto.decryptUsingAES256
        let decryptedProjectName = newProject.projectName //crypto.decryptUsingAES256

        const projectData = {
            projectDescription: newProject.projectDescription,
            projectKey: newProject.projectKey,
            projectName: newProject.projectName,
            managerID: newProject.managerID,
            projectEndDate: newProject.projectEndDate //crypto.decryptUsingAES256
        }

        // Insert the project data into the Project table
        const [projectRows, fieldsUser] = await conn.query(insertProjectSql, projectData);

        // Retrieve the project ID of the newly inserted project
        const projectID = projectRows.insertId;

        // Insert users into the Project_User table
        if (newProject.userIDs && newProject.userIDs.length > 0) {
            for (const user of newProject.userIDs) {
                let userID = user.userID //crypto.decryptUsingAES256
                //TODO: generate User Project Key
                let unencryptedUserProjectKey = ""
                await conn.query("INSERT INTO Project_User (userID, projectID, userProjectKey) VALUES (?, ?, ?)", [userID, projectID, unencryptedUserProjectKey]);
            }
        }

        await conn.commit();
        //let encryptedProjectID = crypto.encryptUsingAES256(projectID, newProject.projectKey)
        // Return the inserted project's ID
        result(null, { projectID: projectID });
    } catch (error) {
        await conn.rollback();
        console.error("Error occurred while inserting a new Project: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

// Function to retrieve all projects
Project.getAll = async (result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const projects = [];
        const [projectRows,] = await conn.query('SELECT * FROM Project');
        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const query = `
                SELECT u.userID, u.userName, u.firstName, u.lastName, u.orgEinheit
                FROM ProjectManager AS pm
                JOIN User AS u ON pm.userID = u.userID
                WHERE pm.managerID = ?
                `;

                const [projectManager] = await conn.query(query, [projectRow.managerID]);
                const [projectUserRows,] = await conn.query('SELECT userID FROM Project_User where projectID=?', projectRow.projectID);
                let users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectRow.projectID,
                    projectName: projectRow.projectName,
                    description: projectRow.projectDescription,
                    key: projectRow.projectKey,
                    endDate: projectRow.projectEndDate,
                    managerID: projectRow.managerID,
                    manager: projectManager,
                    users: users,
                };
                projects.push(project);
            }
            result(null, projects);
        } else {
            result({ message: "No projects found" }, null);
        }
    } catch (error) {
        console.error("Error retrieving projects from database:", error);
        result({ message: "Error retrieving projects from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// Function to retrieve all projects associated with a specific user
Project.findByUserID = async (userID, result) => {
    let conn;
    try {
        console.log("User ID:" + userID)
        conn = await connectionPool.promise().getConnection();

        // Query the database to find projects associated with the user
        const [projectRows,] = await conn.query(`
        SELECT p.*
        FROM Project p
        INNER JOIN Project_User pu ON p.projectID = pu.projectID
        WHERE pu.userID = ?
        `, [userID]);
        console.log(projectRows[0])
        const projects = [];

        // If the project is found, proceed to fetch users associated with the project
        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const projectData = projectRow; // Retrieve the project data
                const query = `
                SELECT u.userID, u.userName, u.firstName, u.lastName, u.orgEinheit
                FROM ProjectManager AS pm
                JOIN User AS u ON pm.userID = u.userID
                WHERE pm.managerID = ?
                `;

                const [projectManager] = await conn.query(query, [projectRow.managerID]);
                const [projectUserRows,] = await conn.query('SELECT userID FROM Project_User where projectID=?', projectData.projectID);
                let users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectData.projectID,
                    projectName: projectData.projectName,
                    description: projectData.projectDescription,
                    key: projectData.projectKey,
                    endDate: projectRow.projectEndDate,
                    managerID: projectData.managerID,
                    manager: projectManager,
                    users: users,
                };
                projects.push(project)
            }
            console.log(projects)
            // Return the project object with associated users
            result(null, projects);

        } else {
            // No projects found for the user
            result({ message: `No projects found for user with ID ${userID}` }, null);
        }
    } catch (error) {
        console.error("Error retrieving projects from database:", error);
        result({ message: "Error retrieving projects from database" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to update a project by ID
Project.updateByID = async (projectData, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Update project details in the Project table
        await conn.query('UPDATE Project SET projectName = ?, projectDescription = ?, projectKey = ?, projectEndDate = ?, managerID = ? WHERE projectID = ?', [projectData.projectName, projectData.projectDescription, projectData.projectKey, new Date(projectData.projectEndDate), projectData.managerID, projectData.projectID]);

        // Delete existing entries in Project_User table for the project
        await conn.query('DELETE FROM Project_User WHERE projectID = ?', projectData.projectID);

        // Insert users into the Project_User table
        if (projectData.userIDs && projectData.userIDs.length > 0) {
            for (const user of projectData.userIDs) {
                let userID = user.userID //crypto.decryptUsingAES256
                //TODO: generate User Project Key
                let unencryptedUserProjectKey = ""
                await conn.query("INSERT INTO Project_User (userID, projectID, userProjectKey) VALUES (?, ?, ?)", [userID, projectData.projectID, unencryptedUserProjectKey]);
            }
        }

        await conn.commit();
        result(null, "Project updated successfully");
    } catch (error) {
        console.error("Error occurred while updating project: ", error);
        await conn.rollback();
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

// Function to delete a project by ID
Project.remove = async (projectId, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Delete associated records from the ActivityLogProject table
        await conn.query("DELETE FROM ActivityLog WHERE projectID = ?", projectId);

        // Delete associated records from the Project_User table
        await conn.query("DELETE FROM Project_User WHERE projectID = ?", projectId);

        // Delete the project from the Project table
        const [projectDeleteResult] = await conn.query("DELETE FROM Project WHERE projectID = ?", projectId);

        await conn.commit();

        // Return the number of affected rows
        result(null, projectDeleteResult.affectedRows);
    } catch (error) {
        console.error("Error occurred while deleting the project: ", error);
        await conn.rollback();
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
}


//---------------------------------------------- Helper Method ---------------------------------------//

// Function to retrieve users for a project
Project.getProjectUsers = async (projectUserRows) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const users = [];

        for (const userRow of projectUserRows) {
            const [userRows,] = await conn.query('SELECT * FROM user WHERE userID = ?', userRow.userID);
            if (userRows.length > 0) {
                let userData = userRows[0];
                let role;
                let [managerRows, managerFields] = await conn.query("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", userData.userID);
                if (userData.isAdmin === 1) {
                    role = Role.ADMIN;
                } else if (managerRows[0].isProjectManager === 1) {
                    role = Role.PROJECT_MANAGER;
                } else {
                    role = Role.USER;
                }
                const user = {
                    userID: userData.userID,
                    username: userData.userName,
                    firstname: userData.firstName,
                    lastname: userData.lastName,
                    role: role,
                    orgEinheit: userData.orgEinheit
                };
                users.push(user);
            }
        }
        return users;
    } catch (error) {
        console.error("Error retrieving users from database:", error);
        throw { message: "Error retrieving users from database" };
    } finally {
        if (conn) {
            conn.release();
        }
    }
};
module.exports = {
    Project
};
