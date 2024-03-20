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
    publicKey VARCHAR(255),
    orgEinheit VARCHAR(255),
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
INSERT INTO User (userName, firstName, lastName, email, passwordHash, salt, publicKey, orgEinheit, isAdmin)
VALUES 
    ('admin', 'John', 'Doe', 'john@example.com', '29988a08bf4d3b1adc726e2574aee718d26469eaceab41e12213b239842f4014', 'f01fb63f89714891697161ba1bc08d28', 1),
    ('janedoe', 'Jane', 'Doe', 'jane.doe@example.com', '2a2052f84cb9b88ae368c9b2673ff3b4e3313beea15721837242f77cb7edfc5f', 'b5f14d2f4a29424e8b86aa1fcd7c2c07', 0),
    ('alice', 'Alice', 'Smith', 'alice.smith@example.com', '784efeb95c7aef1d6d08c5b53bea14c08b6c4e08368c053ecfae3b1114f47b1f', '64323ec7bfa74155a89709b45f18924b', 0),
    ('johnsmith', 'John', 'Smith', 'john.smith@example.com', '3a1f2b5686a0c8fbc2d3fe5a438d74c314e7a3082a57ad8b29b3d3c79222bc91', '4b0b02c58c784118b30c888d582c6d67', 0),
    ('sarahconnor', 'Sarah', 'Connor', 'sarah.connor@example.com', 'fc6b4f5c6c87574a90ed7159a0f085ab5f848c10434e7d52c862b3db5a1675a9', 'd7e8d1cda2a64e279145c245742b0a0d', 0),
    ('bobsmith', 'Bob', 'Smith', 'bob.smith@example.com', '6f4658b9b1506d164f95c5227243f7b4b7b9b6791e26d16fe7754dc49a7cc930', '8a10945279e448b5ad0e44c4d4657857', 0),
    ('emilyjones', 'Emily', 'Jones', 'emily.jones@example.com', 'a3d7259b6d18b7c8e1873b4ad9c71d2bc8e034c4d1a5b0cb7c5c396c5b1e68f0', '9fc076f96ac5464e9c2d87c086ea8f0d', 0),
    ('michaelwang', 'Michael', 'Wang', 'michael.wang@example.com', 'e16d04dbcf4a84a24d3d155e7309f3a702a4c573dcb556dfec7b572a2d9d4d7e', '2064222e75dc4186b4d1f7002d7a20d9', 0),
    ('laurasmith', 'Laura', 'Smith', 'laura.smith@example.com', 'f9f6ac8e58e7e4d98bcb9b119106c4dd41b05a6a7f92520a13c6eb1e9deed4cb', 'ff3c93fd30e24cc0a2e55f53c96497c9', 0);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1),
    (3),
	(8);
    
-- Insert activity logs for all users with current timestamp
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('{"userID":1,"username":"admin","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 1, NOW()),
    ('{"userID":2,"username":"janedoe","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 2, NOW()),
    ('{"userID":3,"username":"alice","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 3, NOW()),
    ('{"userID":4,"username":"johnsmith","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 4, NOW()),
    ('{"userID":5,"username":"sarahconnor","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 5, NOW()),
    ('{"userID":6,"username":"bobsmith","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 6, NOW()),
	('{"userID":7,"username":"emilyjones","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 7, NOW()),
    ('{"userID":8,"username":"michaelwang","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 8, NOW()),
    ('{"userID":9,"username":"laurasmith","timeStamp": "2024-03-15T18:19:06.926Z","projectName":"","projectID":"","viewedUserID":"","viewedUsername":"","filename":"","errorMessage":""}', 'CREATE_USER', 9, NOW());

