const { connectionPool } = require("./db");
const { Role } = require("./role");

const Project = function (project, dateTime) {
    this.projectID = project.projectID;
    this.projectName = project.projectName;
    this.projectDescription = project.projectDescription;
    this.dateTime = dateTime;
};

Project.create = async (newProject, userIDs) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const insertProjectSql = `
            INSERT INTO project 
            (projectName, projectDescription, projectEndDate, managerID) 
            VALUES ( ?, ?, ?, ?)`;

        const projectData = [
            newProject.projectName,
            newProject.projectDescription,
            new Date(newProject.projectEndDate),
            newProject.managerID
        ];

        const [newProjectRow] = await conn.execute(insertProjectSql, projectData);

        if (newProjectRow.length === 0) {
            throw new Error('Project creation failed, projectID not found.');
        }

        const [managerRow] = await conn.execute('SELECT userID FROM ProjectManager WHERE managerID = ?', [newProject.managerID]);
        if (managerRow.length === 0) {
            throw new Error('Project manager not found.');
        }
        const managerUserID = managerRow[0].userID;

        if (!userIDs.includes(managerUserID)) {
            userIDs.push(managerUserID);
        }

        if (userIDs && userIDs.length > 0) {
            const insertProjectUserSql = "INSERT INTO Project_User (userID, projectID) VALUES (?, ?)";
            for (const user of userIDs) {
                await conn.execute(insertProjectUserSql, [user, newProjectRow.insertId]);
            }
        }
       return newProjectRow.insertId;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

Project.getAll = async () => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const projects = [];
        const [projectRows] = await conn.execute('SELECT * FROM Project');
        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const managerQuery = `
                SELECT u.userID, u.userName, u.firstName, u.lastName, u.orgEinheit
                FROM ProjectManager AS pm
                JOIN User AS u ON pm.userID = u.userID
                WHERE pm.managerID = ?`;

                const [projectManager] = await conn.execute(managerQuery, [projectRow.managerID]);
                const [projectUserRows] = await conn.execute('SELECT userID FROM Project_User WHERE projectID = ?', [projectRow.projectID]);
                const users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectRow.projectID,
                    projectName: projectRow.projectName,
                    projectDescription: projectRow.projectDescription,
                    projectEndDate: projectRow.projectEndDate,
                    managerID: projectRow.managerID,
                    manager: projectManager,
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

Project.findByUserID = async (userID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        const query = `
        SELECT p.*
        FROM Project p
        INNER JOIN Project_User pu ON p.projectID = pu.projectID
        WHERE pu.userID = ?`;

        const [projectRows] = await conn.execute(query, [userID]);
        const projects = [];

        if (projectRows.length > 0) {
            for (const projectRow of projectRows) {
                const managerQuery = `
                SELECT u.userID, u.userName, u.firstName, u.lastName, u.orgEinheit
                FROM ProjectManager AS pm
                JOIN User AS u ON pm.userID = u.userID
                WHERE pm.managerID = ?`;

                const [projectManager] = await conn.execute(managerQuery, [projectRow.managerID]);
                const [projectUserRows] = await conn.execute('SELECT userID FROM Project_User WHERE projectID = ?', [projectRow.projectID]);
                const users = await Project.getProjectUsers(projectUserRows);

                const project = {
                    projectID: projectRow.projectID,
                    projectName: projectRow.projectName,
                    projectDescription: projectRow.projectDescription,
                    projectEndDate: projectRow.projectEndDate,
                    managerID: projectRow.managerID,
                    manager: projectManager,
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

Project.deriveProjectID = async () => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const year = new Date().getFullYear();
        const query = `SELECT COUNT(*) as count FROM Project WHERE projectID LIKE ?`;
        const [rows] = await conn.execute(query, [`${year}-%`]);
        const sequenceNumber = String(rows[0].count + 1).padStart(3, '0');
        return `${year}-${sequenceNumber}`;
    } catch (error) {
        console.error('Error generating project ID:', error);
        throw error;
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

Project.updateByID = async (projectData) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        await conn.execute('UPDATE Project SET projectName = ?, projectDescription = ?, projectEndDate = ?, managerID = ? WHERE projectID = ?',
            [projectData.projectName, projectData.projectDescription, new Date(projectData.projectEndDate), projectData.managerID, projectData.projectID]);

        await conn.execute("DELETE FROM Project_User WHERE projectID = ?", [projectData.projectID]);

        if (projectData.userIDs && projectData.userIDs.length > 0) {
            for (const userID of projectData.userIDs) {
                await conn.execute("INSERT INTO Project_User (userID, projectID) VALUES (?, ?)", [userID, projectData.projectID]);
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

Project.remove = async (projectID) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        await conn.execute("DELETE FROM Log WHERE projectID = ?", [projectID]);
        await conn.execute("DELETE FROM Project_User WHERE projectID = ?", [projectID]);
        const [result] = await conn.execute("DELETE FROM Project WHERE projectID = ?", [projectID]);

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

// Helper Method to retrieve users for a project
Project.getProjectUsers = async (projectUserRows) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        const users = [];

        for (const userRow of projectUserRows) {
            const [userRows] = await conn.execute('SELECT * FROM user WHERE userID = ?', [userRow.userID]);
            if (userRows.length > 0) {
                let userData = userRows[0];
                let role;
                let [managerRows] = await conn.execute("SELECT COUNT(*) AS isProjectManager FROM projectmanager WHERE userID = ?", [userData.userID]);
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
                    email: userData.email,
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
