-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

-- User table
CREATE TABLE IF NOT EXISTS User (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    passwordHash VARCHAR(255),
    salt VARCHAR(255),
    orgEinheit VARCHAR(255),
    isAdmin BOOLEAN
);

-- ProjectManager table
CREATE TABLE IF NOT EXISTS ProjectManager (
    managerID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL UNIQUE,
    FOREIGN KEY (userID) REFERENCES User(userID) 
);

-- Project table
CREATE TABLE IF NOT EXISTS Project (
    projectID INT PRIMARY KEY AUTO_INCREMENT,
    projectDescription VARCHAR(255),
    projectName VARCHAR(255),
    projectEndDate DATE, 
    managerID INT,
    FOREIGN KEY (managerID) REFERENCES ProjectManager(managerID)
);

-- Log table
CREATE TABLE IF NOT EXISTS Log (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255),
    name VARCHAR(255),
    userID INT NOT NULL,
    projectID INT,
    timeStamp TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);

-- Project_User table
CREATE TABLE IF NOT EXISTS Project_User (
    userID INT,
    projectID INT,
    PRIMARY KEY (userID, projectID),
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);


-- Sample data
-- Sample data for User table
INSERT INTO User (userName, firstName, lastName, email, passwordHash, salt, orgEinheit, isAdmin)
VALUES 
    ('admin1', 'John', 'Doe', 'john@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 1',1),
    ('admin2', 'Max', 'Mustermann', 'max@example.com','179603da775b19969f87c94e339698c9470ffff6b65046576b8f1931e01cafe4','d28e910ebed196405f8ebb0390555fde','Einheit 2',1),
    ('user1', 'Alice', 'Smith', 'alice@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 1',0),
    ('user2', 'Bob', 'Johnson', 'bob@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 3',0),
    ('user3', 'Charlie', 'Brown', 'charlie@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 4',0),
    ('user4', 'Sarah ', 'Thompson', 'sarah@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 5',0),
    ('user5', 'Michael', 'Rodriguez', 'michael@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 6',0),
    ('user6', 'Daniel', 'Martinez', 'daniel@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 7',0),
    ('user7', 'Jessica', 'Lee', 'jessica@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 8',0),
    ('user8', 'Matthew', 'Clark', 'matthew@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 9',0),
    ('user9', 'Olivia', 'Davis', 'olivia@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 10',0),
    ('user10', 'Joshua', 'Wilson', 'joshua@example.com','8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447','c9a6cd99d8d5dcdbdb74fc73f9c96915','Einheit 11',0);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1),
    (2),
    (4),
    (8);
    
-- Insert activity logs for all users with current timestamp
INSERT INTO Log (description, name, userID, projectID, timeStamp)
VALUES 
    ('{"userID":1,"username":"admin1","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, null, NOW()),
    ('{"userID":2,"username":"admin2","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, null, NOW()),
    ('{"userID":3,"username":"user1","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 3, null, NOW()),
    ('{"userID":4,"username":"user2","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 4, null, NOW()),
    ('{"userID":5,"username":"user3","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 5, null, NOW()),
    ('{"userID":6,"username":"user4","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 6, null, NOW()),
    ('{"userID":7,"username":"user5","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 7, null, NOW()),
    ('{"userID":8,"username":"user6","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 8, null, NOW()),
    ('{"userID":9,"username":"user7","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 9, null, NOW()),
    ('{"userID":10,"username":"user8","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 10, null, NOW()),
    ('{"userID":11,"username":"user9","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 11, null, NOW()),
    ('{"userID":12,"username":"user10","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 12, null, NOW());


-- Create Trigger to set projectID
DELIMITER $$

CREATE TRIGGER before_project_insert_check_id
BEFORE INSERT
ON project FOR EACH ROW
BEGIN
    DECLARE max_projectID INT;
    
    SELECT MAX(projectID) 
    INTO max_projectID
    FROM project;
    
    IF max_projectID < YEAR(NOW())*10000 THEN
        SET NEW.projectID = YEAR(NOW())*10000 + 1;
    END IF; 
END $$

DELIMITER ;