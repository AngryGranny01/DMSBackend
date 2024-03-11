-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

CREATE TABLE User (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255) Unique,
    passwordHash VARCHAR(255),
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
    userID INT,
    projectID INT,
    PRIMARY KEY (userID, projectID),
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (projectID) REFERENCES Project(projectID)
);


-- Sample data for User table
INSERT INTO User (userName, firstName, lastName, email, passwordHash, isAdmin)
VALUES 
    ('user1', 'John', 'Doe', 'john@example.com', '123456', 0),
    ('user2', 'Jane', 'Smith', 'jane@example.com', '654321', 1),
    ('user3', 'Alice', 'Johnson', 'alice@example.com', '987654', 0);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (2),
    (3);

-- Sample data for Project table
INSERT INTO Project (projectDescription, projectKey, projectName, projectEndDate, managerID)
VALUES 
    ('Sample project 1 description', '1234', 'Project 1', '2024-03-15', 1),
    ('Sample project 2 description', '5678', 'Project 2', '2024-04-20', 2),
    ('Sample project 3 description', '9876', 'Project 3', '2024-05-25', 1);

-- Sample data for Project_User table
INSERT INTO Project_User (userID, projectID)
VALUES 
    (1, 1), -- user1 assigned to Project 1
    (2, 2), -- user2 assigned to Project 2
    (3, 3); -- user3 assigned to Project 3

-- Sample data for ActivityLogProject table
INSERT INTO ActivityLog(activityDescription, activityName, userID, projectID, timeStampLog)
VALUES 
    ('Sample activity description 1', 'Activity 1', 1, 1, NOW()),
    ('Sample activity description 2', 'Activity 2', 2, 2, NOW()),
    ('Sample activity description 3', 'Activity 3', 3, 3, NOW());

-- Sample data for ActivityLogUser table
INSERT INTO ActivityLogUser (activityDescription, activityName, userID, timeStampUser)
VALUES 
    ('Sample activity description 4', 'CREATED', 1, NOW()),
    ('Sample activity description 5', 'LOGIN', 2, NOW()),
    ('Sample activity description 6', 'LOGIN', 3, NOW());

