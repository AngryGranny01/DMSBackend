const { connectionPool } = require("./db");

const Project = function (project, dateTime) {
    this.projectID = project.projectID;
    this.projectName = project.projectName;
    this.projectDescription = project.projectDescription;
    this.dateTime = dateTime;
};

// Create a new project
Project.create = async (newProject, userIDs) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        const insertProjectSql = `
            INSERT INTO Project 
            (name, description, endOfProjectDate, managerId) 
            VALUES (?, ?, ?, ?)`;

        const projectData = [
            newProject.projectName,
            newProject.projectDescription,
            newProject.projectEndDate ? new Date(newProject.projectEndDate) : null,
            newProject.managerID
        ];

        const [result] = await conn.execute(insertProjectSql, projectData);
        const newProjectId = result.insertId;

        if (!newProjectId) {
            throw new Error('Project creation failed, projectID not found.');
        }

        if (userIDs && userIDs.length > 0) {
            const insertProjectUserSql = "INSERT INTO Account_Project (accountId, projectId) VALUES (?, ?)";
            for (const userID of userIDs) {
                await conn.execute(insertProjectUserSql, [userID, newProjectId]);
            }
        }

        await conn.commit();
        return newProjectId;
    } catch (error) {
        console.error('Error creating project:', error);
        if (conn) {
            await conn.rollback();
        }
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to retrieve all projects
Project.getAll = async () => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const projects = [];
        const [projectRows] = await conn.execute('SELECT * FROM Project');
        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const managerQuery = `
                SELECT a.id as accountID, p.firstName, p.lastName, p.email, ou.orgUnit 
                FROM Account a
                JOIN Staff p ON a.staffId = p.id
                JOIN Person_OrgUnit ou ON p.id = ou.staffId
                WHERE a.id = ?`;

                const [projectManager] = await conn.execute(managerQuery, [projectRow.managerId]);
                console.log(projectManager[0])
                const [projectUserRows] = await conn.execute('SELECT accountId FROM Account_Project WHERE projectId = ?', [projectRow.id]);
                const users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectRow.id,
                    projectName: projectRow.name,
                    projectDescription: projectRow.description,
                    projectEndDate: projectRow.endOfProjectDate,
                    manager: projectManager[0],
                    users: users,
                };
                projects.push(project);
            }
            return projects;
        } else {
            throw new Error("No projects found");
        }
    } catch (error) {
        console.error("Error retrieving projects from database:", error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


// Function to find projects by user ID
Project.findByUserID = async (userID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const query = `
        SELECT DISTINCT p.*
        FROM Project p
        LEFT JOIN Account_Project ap ON p.id = ap.projectId
        WHERE ap.accountId = ? OR p.managerId = ?`;

        const [projectRows] = await conn.execute(query, [userID, userID]);
        const projects = [];
        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const managerQuery = `
                SELECT a.id as accountID, p.firstName, p.lastName, p.email, ou.name as orgUnit 
                FROM Account a
                JOIN Staff p ON a.staffId = p.id
                JOIN Person_OrgUnit pou ON p.id = pou.staffId
                JOIN OrgUnit ou ON pou.orgUnit = ou.name
                WHERE a.id = ?;`;

                const [projectManager] = await conn.execute(managerQuery, [projectRow.managerId]);
                console.log(projectManager[0])
                const [projectUserRows] = await conn.execute('SELECT accountId FROM Account_Project WHERE projectId = ?', [projectRow.id]);
                const users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectRow.id,
                    projectName: projectRow.name,
                    projectDescription: projectRow.description,
                    projectEndDate: projectRow.endOfProjectDate,
                    manager: projectManager[0],
                    users: users,
                };
                projects.push(project);
            }
            return projects;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error retrieving projects from database:", error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


/**
 * Update a project by its ID.
 * @param {Object} projectData - The project data to update.
 * @returns {Promise<boolean>} - Returns true if the update was successful.
 */
Project.updateByID = async (projectData) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();
        console.log(projectData)
        await conn.execute(
            'UPDATE Project SET name = ?, description = ?, endOfProjectDate = ?, managerId = ? WHERE id = ?',
            [
                projectData.projectName,
                projectData.projectDescription,
                projectData.projectEndDate ? new Date(projectData.projectEndDate) : null,
                projectData.managerID,
                projectData.projectID
            ]
        );

        await conn.execute("DELETE FROM Account_Project WHERE projectId = ?", [projectData.projectID]);

        if (projectData.userIDs && projectData.userIDs.length > 0) {
            for (const userID of projectData.userIDs) {
                await conn.execute("INSERT INTO Account_Project (accountId, projectId) VALUES (?, ?)", [userID, projectData.projectID]);
            }
        }

        await conn.commit();
        return true;
    } catch (error) {
        console.error("Error occurred while updating project: ", error);
        await conn.rollback();
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to update the managerId of a project
Project.updateManagerID = async (oldManagerID, newManagerID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Update the managerId in the Project table
        const [result] = await conn.execute(
            "UPDATE Project SET managerId = ? WHERE managerId = ?",
            [newManagerID, oldManagerID]
        );

        await conn.commit();
        return result.affectedRows;
    } catch (error) {
        console.error("Error occurred while updating the manager ID: ", error);
        await conn.rollback();
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


Project.remove = async (projectID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        await conn.execute("DELETE FROM Account_Project WHERE projectId = ?", [projectID]);
        await conn.execute("DELETE FROM Project_Document WHERE projectId = ?", [projectID]);
        const [result] = await conn.execute("DELETE FROM Project WHERE id = ?", [projectID]);

        await conn.commit();
        return result.affectedRows;
    } catch (error) {
        console.error("Error occurred while deleting the project: ", error);
        await conn.rollback();
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Helper Function to retrieve  all users associated with a project
Project.getProjectUsers = async (projectUserRows) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const users = [];

        const userDetailsQuery = `
            SELECT a.id as accountID, p.firstName, p.lastName, p.email, ou.orgUnit, ur.userRole as role, a.isDeactivated
            FROM Account a
            JOIN Staff p ON a.staffId = p.id
            JOIN Person_OrgUnit ou ON p.id = ou.staffId
            JOIN Account_UserRole ur ON a.id = ur.accountId
            WHERE a.id = ?`;

        for (const userRow of projectUserRows) {

            const [userDetails] = await conn.execute(userDetailsQuery, [userRow.accountId]);

            if (userDetails.length > 0) {
                users.push(userDetails[0]);
            }

        }
        return users;
    } catch (error) {
        console.error("Error retrieving project users:", error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


module.exports = {
    Project
};
