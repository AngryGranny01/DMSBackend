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
    publicKey VARCHAR(2048), -- Adjusted length for publicKey
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
    projectEndDate DATE, -- Consider using DATETIME or TIMESTAMP if needed
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
    userProjectKey VARCHAR(255),
    userID INT,
    projectID INT,
    PRIMARY KEY (userID, projectID),
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);

-- Sample data
-- Sample data for User table
INSERT INTO User (userName, firstName, lastName, email, passwordHash, salt, publicKey, orgEinheit, isAdmin)
VALUES 
    ('admin', 'John', 'Doe', 'john@example.com', 'c932398e9decfbb23710fd4d57ccc5047d7a1fc50d1c73c1bb94fb86bb985729', 'b810b51a9d9f6e81e5ea35fb4d532b1c', '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAocREsfAOim6a1u37fbCI
JTzw7JqohhemPHYeAzfJ/YN4TDMz1L3m8eWCVu0wKfq1+S3UoPd7Wz8rcUnleG0B
Y47Wx/+JCMybZjgtG75sOvcJbuiUkaOK2N4vdjVVZFHDxNh/uPN/oakaCNxn8t/H
6+P+oHCt6bMotnd2HtyeONaOGMCHrefHQ9VyA6/sEe3v0za3hl82ERoWl41foQ64
yby1rWh6tMXCO5CHdnXST72ajXLGFzZgdfdbiWZ6hNJVv9k2tT7gaL1GGiNvUSVZ
FyL+w5o1C3UfSMSnm4f0rDBq0MbKc7Z0Eho+QyFjFsYQKXpk8IsBiia3q00OahPS
YwIDAQAB
-----END PUBLIC KEY-----','Einheit 1',1);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1);
    
-- Insert activity logs for all users with current timestamp
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('{"userID":1,"username":"admin","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW());
