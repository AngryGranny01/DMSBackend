const { connectionPool } = require("./db");

const ProjectManager = function (managerID, userID) {
    this.managerID = managerID;
    this.userID = userID;
};

// Function to update ProjectManager by ID
ProjectManager.updateByID = async (userID, managerID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Update query
        await conn.query('UPDATE ProjectManager SET managerID = ? WHERE userID = ?', [managerID, userID]);

        await conn.commit();
        result(null, "Project Manager updated successfully");
    } catch (error) {
        console.error("Error occurred while updating Project Manager: ", error);
        await conn.rollback();
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// Function to get Project Manager ID by User ID
ProjectManager.getProjectManagerIDByUserID = async (userID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();

        // Query to retrieve Project Manager ID using User ID
        const [rows] = await conn.query('SELECT managerID FROM ProjectManager WHERE userID = ?', [userID]);
        
        if (rows.length > 0) {
            const managerID = rows[0].managerID;
            result(null, managerID);
        } else {
            result("Project Manager not found for the provided User ID", null);
        }
    } catch (error) {
        console.error("Error occurred while fetching Project Manager ID: ", error);
        result(error, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

module.exports = {
    ProjectManager
}