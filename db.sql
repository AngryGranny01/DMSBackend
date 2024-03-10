-- Create the dmsproject database if it doesn't exist
CREATE DATABASE IF NOT EXISTS dmsproject;

-- Use the dmsproject database
USE dmsproject;

-- Create the user table
CREATE TABLE IF NOT EXISTS user (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) UNIQUE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    passwordHash VARCHAR(255),
    isAdmin BOOLEAN
);

-- Create the time table
CREATE TABLE IF NOT EXISTS time (
    timeID INT PRIMARY KEY AUTO_INCREMENT,
    day INT,
    month INT,
    year INT,
    hour INT,
    minute INT
);

-- Create the projectmanager table
CREATE TABLE IF NOT EXISTS projectmanager (
    projectManagerID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT,
    FOREIGN KEY (userID) REFERENCES user(userID)
);

-- Create the project table
CREATE TABLE IF NOT EXISTS project (
    projectID INT PRIMARY KEY AUTO_INCREMENT,
    projectName VARCHAR(255),
    projectDescription VARCHAR(255),
    projectKeyHash VARCHAR(255),
    projectManagerID INT,
    timeID INT,
    FOREIGN KEY (projectManagerID) REFERENCES projectmanager(projectManagerID),
    FOREIGN KEY (timeID) REFERENCES time(timeID)
);

-- Create the activitylog table
CREATE TABLE IF NOT EXISTS activitylog (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    activityName VARCHAR(255),
    activityDescription VARCHAR(255),
    userID INT,
    timeID INT,
    FOREIGN KEY (userID) REFERENCES user(userID),
    FOREIGN KEY (timeID) REFERENCES time(timeID)
);

-- Create the project_user table for the many-to-many relationship between project and user
CREATE TABLE IF NOT EXISTS project_user (
    projectID INT,
    userID INT,
    PRIMARY KEY (projectID, userID),
    FOREIGN KEY (projectID) REFERENCES project(projectID),
    FOREIGN KEY (userID) REFERENCES user(userID)
);

-- Insert sample data into the user table
INSERT INTO user (userName,firstName, lastName, email, passwordHash, isAdmin)
VALUES
    ('OhJonny','John', 'Doe', 'john.doe@example.com', 'password123', TRUE),
    ('jan80','Jane', 'Smith', 'jane.smith@example.com', 'abcdef', FALSE),
    ('hackerman','Alice', 'Johnson', 'alice.johnson@example.com', '123456', FALSE);

-- Insert sample data into the time table
INSERT INTO time (day, month, year, hour, minute)
VALUES
    (01, 01, 2022, 12, 30),
    (02, 02, 2022, 10, 15),
    (03, 03 , 2022, 14, 45);


-- Insert sample data into the projectmanager table
INSERT INTO projectmanager (userID)
VALUES (1), (3);

-- Insert sample data into the project table
INSERT INTO project (projectName, projectDescription, projectKeyHash, projectManagerID, timeID)
VALUES
    ('Project 1', 'Description 1', 'hash1', 1, 1),
    ('Project 2', 'Description 2', 'hash2', 2, 2),
    ('Project 3', 'Description 3', 'hash3', 1, 3);

-- Insert sample data into the activitylog table
INSERT INTO activitylog (activityName, activityDescription, userID, timeID)
VALUES
    ('LOGIN', 'qwdqdqdqwdqwdqwdqwd', 1, 1),
    ('LOGIN', 'sdaasdasdfasfasfasf', 2, 2),
    ('CREATED', 'sagsagdgadgagagD', 1, 3);

-- Insert sample data into the project_user table
INSERT INTO project_user (projectID, userID)
VALUES
    (1, 1),
    (2, 1),
    (2, 2),
    (3, 3);
