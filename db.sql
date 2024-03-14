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

------------------------------ SAMPLE DATA ----------------------------------
-- Sample data for User table
INSERT INTO User (userName, firstName, lastName, email, passwordHash, isAdmin)
VALUES 
    ('admin', 'John', 'Doe', 'john@example.com', '123456', 1),
    ('user2', 'Jane', 'Smith', 'jane@example.com', '654321', 0),
    ('user3', 'Alice', 'Johnson', 'alice@example.com', 'password123', 0),
    ('user4', 'Bob', 'Smith', 'bob@example.com', 'password456', 0),
    ('user5', 'Charlie', 'Brown', 'charlie@example.com', 'password789', 0),
    ('user6', 'David', 'Miller', 'david@example.com', 'password123', 0),
    ('user7', 'Emma', 'Wilson', 'emma@example.com', 'password456', 0),
    ('user8', 'Frank', 'Taylor', 'frank@example.com', 'password789', 0),
    ('user9', 'Grace', 'Anderson', 'grace@example.com', 'password123', 0),
    ('user10', 'Henry', 'Martinez', 'henry@example.com', 'password456', 0),
    ('user11', 'Isabella', 'Harris', 'isabella@example.com', 'password789', 0),
    ('user12', 'Jack', 'Allen', 'jack@example.com', 'password123', 0);

-- Sample data for ProjectManager table
INSERT INTO ProjectManager (userID)
VALUES 
    (1),
    (3),
    (5),
    (8);

-- Sample data for Project table
INSERT INTO Project (projectDescription, projectKey, projectName, projectEndDate, managerID)
VALUES 
    ('Sample project 1 description', '1234', 'Project 1', '2024-03-15', 1),
    ('Sample project 2 description', '5678', 'Project 2', '2024-04-20', 2),
    ('Sample project 3 description', '9876', 'Project 3', '2024-05-25', 3),
    ('Sample project 4 description', '4321', 'Project 4', '2024-06-30', 3),
    ('Sample project 5 description', '8765', 'Project 5', '2024-07-15', 3),
    ('Sample project 6 description', '1357', 'Project 6', '2024-08-20', 2),
    ('Sample project 7 description', '2468', 'Project 7', '2024-09-25', 1),
    ('Sample project 8 description', '9753', 'Project 8', '2024-10-30', 3),
    ('Sample project 9 description', '8642', 'Project 9', '2024-11-15', 2),
    ('Sample project 10 description', '7531', 'Project 10', '2024-12-20', 4);

-- Sample data for Project_User table
INSERT INTO Project_User (userID, projectID)
VALUES 
    (1, 1), -- user1 assigned to Project 1
    (2, 1), 
    (3, 1),
    (4, 1), 
    (5, 1),
    (6, 1), 
    (7, 1),
    (8, 1), 
    (9, 1),
    (10, 1), 
    (11, 1),
    (12, 1), 
    (1, 2),
    (2, 2), 
    (3, 2),
    (4, 2), 
    (5, 2);

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

