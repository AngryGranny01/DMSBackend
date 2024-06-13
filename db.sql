-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

-- User table
CREATE TABLE User (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) UNIQUE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    passwordHash VARCHAR(255),
    salt VARCHAR(255),
    orgEinheit VARCHAR(255),
    isAdmin BOOLEAN
);

-- ProjectManager table
CREATE TABLE ProjectManager (
    managerID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT,
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Project table
CREATE TABLE Project (
    projectID INT PRIMARY KEY AUTO_INCREMENT,
    projectDescription VARCHAR(255),
    projectKey VARCHAR(255),
    projectName VARCHAR(255),
    projectEndDate DATE, 
    managerID INT,
    FOREIGN KEY (managerID) REFERENCES ProjectManager(managerID)
);

-- ActivityLog table
CREATE TABLE ActivityLog (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    activityDescription VARCHAR(255),
    activityName VARCHAR(255),
    userID INT,
    projectID INT,
    timeStampLog TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);

-- ActivityLogUser table
CREATE TABLE ActivityLogUser (
    logUserID INT PRIMARY KEY AUTO_INCREMENT,
    activityDescription VARCHAR(255),
    activityName VARCHAR(255),
    userID INT,
    timeStampUser TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID)
);

-- Project_User table
CREATE TABLE Project_User (
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
    ('admin2', 'Max', 'Mustermann', 'max@example.com','179603da775b19969f87c94e339698c9470ffff6b65046576b8f1931e01cafe4','d28e910ebed196405f8ebb0390555fde','Einheit 2',1);
-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1),
    (2);
    
-- Insert activity logs for all users with current timestamp
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('{"userID":1,"username":"admin1","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":2,"username":"admin2","timeStamp": "","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW());
