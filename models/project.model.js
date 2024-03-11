const { connectionPool } = require("./db");

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
        const projectData = {
            projectDescription: newProject.projectDescription,
            projectKey: newProject.projectKey,
            projectName: newProject.projectName,
            managerID: newProject.managerID,
            projectEndDate: new Date(newProject.projectEndDate)
        }
        console.log(projectData)

        // Insert the project data into the Project table
        const [projectRows, fieldsUser] = await conn.query(insertProjectSql, projectData);

        // Retrieve the project ID of the newly inserted project
        const projectId = projectRows.insertId;

        // Insert user IDs into the Project_User table
        if (newProject.userIDs && newProject.userIDs.length > 0) {
            for (const user of newProject.userIDs) {
                await conn.query("INSERT INTO Project_User (userID, projectID) VALUES (?, ?)", [user.userID, projectId]);
            }
        }

        await conn.commit();
        // Return the inserted project's ID
        result(null, { id: projectId });
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

        // Query the database to get all projects
        const [projectRows,] = await conn.query('SELECT * FROM Project');

        // If projects are found, return them
        if (projectRows.length > 0) {
            result(null, projectRows);
        } else {
            // No projects found
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

// Function to retrieve a specific project by ID
Project.findByID = async (projectID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query the database to find the project by projectID
        const [projectRows,] = await conn.query('SELECT * FROM Project WHERE projectID = ?', [projectID]);

        // If the project is found, proceed to fetch users associated with the project
        if (projectRows.length > 0) {
            const project = projectRows[0]; // Retrieve the project data

            // Query to fetch users associated with the project
            // Only necessary user info for project!
            const [userRows,] = await conn.query(`
        SELECT u.userID, 
        u.userName, 
        u.firstName, 
        u.lastName
        FROM User u
        INNER JOIN Project_User pu ON u.userID = pu.userID
        WHERE pu.projectID = ?
      `, [projectID]);

            // Attach users data to the project object
            project.users = userRows;

            // Return the project object with associated users
            result(null, project);
        } else {
            // Project not found
            result({ message: `Project with ID ${projectID} not found` }, null);
        }
    } catch (error) {
        console.error("Error retrieving project from database:", error);
        result({ message: "Error retrieving project from database" }, null);
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
        conn = await connectionPool.promise().getConnection();

        // Query the database to find projects associated with the user
        const [projectRows,] = await conn.query(`
      SELECT p.*
      FROM Project p
      INNER JOIN Project_User pu ON p.projectID = pu.projectID
      WHERE pu.userID = ?
    `, [userID]);

        // If projects are found, return them
        if (projectRows.length > 0) {
            result(null, projectRows);
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

        // Extract project data
        const { projectID, projectName, projectDescription, projectKey, projectEndDate, managerID, userIDs } = projectData;

        // Update project details in the Project table
        await conn.query('UPDATE Project SET projectName = ?, projectDescription = ?, projectKey = ?, projectEndDate = ?, managerID = ? WHERE projectID = ?', [projectName, projectDescription, projectKey, projectEndDate, managerID, projectID]);

        // Delete existing entries in Project_User table for the project
        await conn.query('DELETE FROM Project_User WHERE projectID = ?', projectID);

        // Insert new entries in Project_User table for the project
        const insertUserPromises = userIDs.map(async ({ userID }) => {
            await conn.query('INSERT INTO Project_User (userID, projectID) VALUES (?, ?)', [userID, projectID]);
        });
        await Promise.all(insertUserPromises);

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

module.exports = {
    Project
};
