-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

-- User table
CREATE TABLE User (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255),
    salt VARCHAR(255),
    orgEinheit VARCHAR(255),
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE
);

-- ProjectManager table
CREATE TABLE ProjectManager (
    managerID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL UNIQUE,
    FOREIGN KEY (userID) REFERENCES User(userID) 
);

-- Project table
CREATE TABLE Project (
    projectID VARCHAR(8) PRIMARY KEY,
    projectDescription VARCHAR(255) NOT NULL,
    projectName VARCHAR(255) NOT NULL,
    projectEndDate DATE, 
    managerID INT NOT NULL,
    FOREIGN KEY (managerID) REFERENCES ProjectManager(managerID)
);

-- ActivityLog table
CREATE TABLE ActivityLog (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    activityDescription VARCHAR(255) NOT NULL,
    activityName VARCHAR(255) NOT NULL,
    userID INT NOT NULL,
    projectID VARCHAR(8) NOT NULL,
    timeStampLog TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);

-- ActivityLogUser table
CREATE TABLE ActivityLogUser (
    logUserID INT PRIMARY KEY AUTO_INCREMENT,
    activityDescription VARCHAR(255),
    activityName VARCHAR(255),
    userID INT,
    timeStampUser TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Project_User table
CREATE TABLE Project_User (
    userID INT,
    projectID VARCHAR(8),
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
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('{"userID":1,"username":"admin1","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":2,"username":"admin2","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":3,"username":"user1","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":4,"username":"user2","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":5,"username":"user3","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":6,"username":"user4","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":7,"username":"user5","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":8,"username":"user6","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":9,"username":"user7","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":10,"username":"user8","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":11,"username":"user9","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":12,"username":"user10","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW());
