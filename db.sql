-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

CREATE TABLE User (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) Unique,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255) Unique,
    passwordHash VARCHAR(255),
    salt VARCHAR(255),
    isAdmin BOOLEAN
);

CREATE TABLE ProjectManager (
    managerID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT,
    FOREIGN KEY (userID) REFERENCES User(userID)
);

CREATE TABLE Project (
    projectID INT PRIMARY KEY AUTO_INCREMENT,
    projectDescription VARCHAR(255),
    projectKey VARCHAR(255),
    projectName VARCHAR(255),
    projectEndDate DATE,
	managerID INT,
    FOREIGN KEY (managerID) REFERENCES ProjectManager(managerID)

);

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

CREATE TABLE ActivityLogUser (
    logUserID INT PRIMARY KEY AUTO_INCREMENT,
    activityDescription VARCHAR(255),
    activityName VARCHAR(255),
    userID INT,
    timeStampUser TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES User(userID)
);

CREATE TABLE Project_User (
	userProjectKey VARCHAR(255),
    userID INT,
    projectID INT,
    PRIMARY KEY (userID, projectID),
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);
------------------------------ SAMPLE DATA ----------------------------------
-- Sample data for User table
INSERT INTO User (userName, firstName, lastName, email, passwordHash, salt,isAdmin)
VALUES 
    ('admin', 'John', 'Doe', 'john@example.com', '29988a08bf4d3b1adc726e2574aee718d26469eaceab41e12213b239842f4014', 'f01fb63f89714891697161ba1bc08d28' ,1);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1);

-- Insert activity logs for all users with current timestamp
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('{"userID":1,"username":"admin","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW());


