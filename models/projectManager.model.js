const { connectionPool } = require("./db");

const ProjectManager = function (managerID, userID) {
    this.managerID = managerID;
    this.userID = userID;
};

// Function to update Project by ID
ProjectManager.updateByID = async (userID, managerID, result) => {
    let conn;
    try {
        conn = await connectionPool.promise().getConnection();
        await conn.beginTransaction();

        // Query to retrieve Project Manager ID using User ID
        const [rows] = await conn.query('SELECT managerID FROM ProjectManager WHERE userID = ?', [userID]);
        
        if (rows.length > 0) {
            const newManagerID = rows[0].managerID;

            // Update Project: Set managerID of projects where managerID = managerID to the new managerID of userID
            const updateQuery = 'UPDATE Project SET managerID = ? WHERE managerID = ?';
            await conn.query(updateQuery, [newManagerID, managerID]);

            await conn.commit();
            result(null, "Project Manager updated successfully");
        }
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
            result({ message: "Project Manager not found for the provided User ID" }, null);
        }
    } catch (error) {
        console.error("Error occurred while fetching Project Manager ID: ", error);
        result({ message: "Error occurred while fetching Project Manager ID" }, null);
    } finally {
        if (conn) {
            conn.release();
        }
    }
};


module.exports = {
    ProjectManager
}