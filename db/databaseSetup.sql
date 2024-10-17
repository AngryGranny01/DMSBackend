CREATE DATABASE IF NOT EXISTS dmsproject;

USE dmsproject;

CREATE TABLE IF NOT EXISTS OrgUnit (name VARCHAR(255) PRIMARY KEY);

CREATE TABLE IF NOT EXISTS Staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    orgUnit VARCHAR(255) NOT NULL,
    FOREIGN KEY (orgUnit) REFERENCES OrgUnit(name)

);

CREATE TABLE IF NOT EXISTS Account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isDeactivated BOOLEAN NOT NULL DEFAULT false,
    staffId INT UNIQUE NOT NULL,
    FOREIGN KEY (staffId) REFERENCES Staff(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Password (
    accountId INT PRIMARY KEY,
    hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS UserRole (name VARCHAR(255) PRIMARY KEY);

CREATE TABLE IF NOT EXISTS Account_UserRole (
    accountId INT NOT NULL,
    userRole VARCHAR(255) NOT NULL,
    PRIMARY KEY (accountId, userRole),
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE,
    FOREIGN KEY (userRole) REFERENCES UserRole(name) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Document (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uploadTimestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    uploaderId INT UNIQUE,
    FOREIGN KEY (uploaderId) REFERENCES Staff(id)
);

CREATE TABLE IF NOT EXISTS Consenter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Project (
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- YYYY%04d
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    remark VARCHAR(255),
    endOfProjectDate DATE,
    archivalDelay INT NOT NULL DEFAULT 1,
    -- in months
    archivalDuration INT NOT NULL DEFAULT 120,
    -- in months
    isArchived BOOLEAN NOT NULL DEFAULT false,
    managerId INT NOT NULL,
    templateId INT UNIQUE,
    FOREIGN KEY (managerId) REFERENCES Account(id),
    FOREIGN KEY (templateId) REFERENCES Document(id) ON DELETE
    SET
        NULL
);

CREATE TABLE IF NOT EXISTS Account_Project (
    accountId INT NOT NULL,
    projectId INT NOT NULL,
    PRIMARY KEY (projectId, accountId),
    -- name most selective column first for better performance
    FOREIGN KEY (accountId) REFERENCES Account(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Revocation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    revocationTimestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    documentId INT UNIQUE NOT NULL,
    FOREIGN KEY (documentId) REFERENCES Document(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Project_Document (
    projectId INT NOT NULL,
    documentId INT NOT NULL,
    PRIMARY KEY (documentId, projectId),
    FOREIGN KEY (projectId) REFERENCES Project(id),
    FOREIGN KEY (documentId) REFERENCES Document(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ConsentForm (
    id INT PRIMARY KEY AUTO_INCREMENT,
    projectId INT NOT NULL,
    consentedBy INT NOT NULL,
    documentId INT UNIQUE NOT NULL,
    revocationId INT UNIQUE,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (consentedBy) REFERENCES Consenter(id),
    FOREIGN KEY (documentId) REFERENCES Document(id) ON DELETE CASCADE,
    FOREIGN KEY (revocationId) REFERENCES Revocation(id) ON DELETE
    SET
        NULL
);

CREATE TABLE IF NOT EXISTS OrgUnit (
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Action (
    -- log action
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Target (
    -- log target
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actorId INT NOT NULL,
    -- user performing an action
    currentActorRole VARCHAR(255) NOT NULL,
    -- user role at the time
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255),
    -- table name (project, account, document, etc.) of the entity effected by the action
    targetId INT,
    -- record id for record lookup in the respective table
    field VARCHAR(255),
    -- property key effected
    value VARCHAR(255),
    -- new property value
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (actorId) REFERENCES Account(id),
    FOREIGN KEY (action) REFERENCES Action(name) ON UPDATE CASCADE,
    FOREIGN KEY (target) REFERENCES Target(name) ON UPDATE CASCADE,
    FOREIGN KEY (currentActorRole) REFERENCES UserRole(name) ON UPDATE CASCADE
);

-- Trigger
-- Sets projectId on insert of new project in the format YYYY%04d, where YYYY represents the current year and %04d are the first 4 digits of the counter of this year's projects (e.g. 20240023 for the 23. project in 2024)
DELIMITER $$

CREATE TRIGGER before_project_insert_check_id
BEFORE INSERT ON project
FOR EACH ROW
BEGIN
    DECLARE max_projectId INT;
    DECLARE baseId INT;

    -- Get the currently highest projectId
    SELECT MAX(id) INTO max_projectId FROM project;

    -- Determine the current year's base ID
    SET baseId = YEAR(NOW()) * 10000;

    -- Check if there are no existing projects
    IF max_projectId IS NULL THEN
        -- If no projects exist, set the new projectId to the first for the current year
        SET NEW.id = baseId + 1;
    ELSE
        -- If the maximum projectId is less than the current year's base ID
        IF max_projectId < baseId THEN
            -- Set the new projectId to be the first for the current year
            SET NEW.id = baseId + 1;
        ELSE
            -- Otherwise, increment the maximum projectId by 1
            SET NEW.id = max_projectId + 1;
        END IF;
    END IF;
END $$
DELIMITER ;

-- Ensures valid targetId for the specified target in Log table
DELIMITER $$

CREATE TRIGGER before_log_insert
BEFORE INSERT ON Log
FOR EACH ROW
BEGIN
    IF NEW.target = 'Staff' THEN
        IF NOT EXISTS (SELECT 1 FROM Staff WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid staffId for target Staff';
        END IF;
    ELSEIF NEW.target = 'Document' THEN
        IF NOT EXISTS (SELECT 1 FROM Document WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target Document';
        END IF;
    ELSEIF NEW.target = 'Project' THEN
        IF NOT EXISTS (SELECT 1 FROM Project WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target Project';
        END IF;
    ELSEIF NEW.target = 'Account' THEN
        IF NOT EXISTS (SELECT 1 FROM Account WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target Account';
        END IF;
    ELSEIF NEW.target = 'Revocation' THEN
        IF NOT EXISTS (SELECT 1 FROM Revocation WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target Revocation';
        END IF;
    ELSEIF NEW.target = 'ConsentForm' THEN
        IF NOT EXISTS (SELECT 1 FROM ConsentForm WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target ConsentForm';
        END IF;
    END IF;
END $$
DELIMITER ;

-- Insert data
INSERT INTO orgUnit (name)
VALUES
    ('Datenschutz'),
    ('Syssec'),
    ('Cybsec'),
    ('Semsys'),
    ('Prosys'),
    ('Infsys'),
    ('Isbi');

INSERT INTO UserRole (name)
VALUES
    ('ADMIN'),
    ('PROJECT MANAGER'),
    ('USER');

INSERT INTO action (name)
VALUES
    ('login'),
    ('logout'),
    ('create'),
    ('update'),
    ('delete'),
    ('upload'),
    ('download'),
    ('archive'),
    ('revoke'),
    ('deactivate');

INSERT INTO target (name)
VALUES
    ('account'),
    ('person'),
    ('project'),
    ('document'),
    ('consentForm'),
    ('orgUnit'),
    ('revocation'),
    ('password');

INSERT INTO Staff (firstName, lastName, email, orgUnit)
VALUES
    ('Admin1', 'Admin1', 'admin1@edu.aau.at', 'Datenschutz'),
    ('Admin2', 'Admin2', 'admin2@edu.aau.at', 'Cybsec'),
    ('John', 'Doe', 'john@example.com', 'Datenschutz'),
    ('Max', 'Mustermann', 'max@example.com', 'Syssec'),
    ('Alice', 'Smith', 'alice@example.com', 'Cybsec'),
    ('Bob', 'Johnson', 'bob@example.com', 'Syssec'),
    ('Charlie', 'Brown', 'charlie@example.com', 'Prosys'),
    ('Sarah ', 'Thompson', 'sarah@example.com', 'Semsys'),
    ('Michael', 'Rodriguez', 'michael@example.com', 'Infsys'),
    ('Daniel', 'Martinez', 'daniel@example.com', 'Semsys'),
    ('Jessica', 'Lee', 'jessica@example.com', 'Syssec'),
    ('Matthew', 'Clark', 'matthew@example.com', 'Datenschutz'),
    ('Olivia', 'Davis', 'olivia@example.com', 'Prosys'), -- person without account
    ('Joshua', 'Wilson', 'joshua@example.com', 'Syssec'); -- person without account


INSERT INTO Account (staffId)
VALUES
    (1), -- admin
    (2),
    (3), -- orgUnit Datenschutz
    (4),
    (5),
    (6),
    (7),
    (8),
    (9), -- deactivated user
    (10), -- deactivated user
    (11),
    (12);

INSERT INTO Account_UserRole (accountId, userRole)
VALUES
    (1, 'ADMIN'),
    (2, 'ADMIN'),
	(3, 'PROJECT MANAGER'),
	(4, 'USER'),
	(5, 'USER'),
    (6, 'PROJECT MANAGER'),
	(7, 'USER'),
	(8, 'USER'),
    (9, 'PROJECT MANAGER'),
	(10, 'USER'),
	(11, 'USER'),
    (12, 'USER');

UPDATE Account SET isDeactivated = true WHERE id IN(9,10);

INSERT INTO Password (accountId, hash, salt)
VALUES
    (1, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (2, '179603da775b19969f87c94e339698c9470ffff6b65046576b8f1931e01cafe4', 'd28e910ebed196405f8ebb0390555fde'),
    (3, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (4, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (5, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (6, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (7, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (8, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (9, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (10, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (11, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915'),
    (12, '8c34c40052acd35b625a125095873f15552e6bc8d2b3ba2dd88fddba1cb3b447', 'c9a6cd99d8d5dcdbdb74fc73f9c96915');

INSERT INTO Project (name, description, endOfProjectDate, managerId)
VALUES
    ('project1', 'Description for Project 1', NULL, 1),
    ('project2', NULL, NOW(), 2);

INSERT INTO Account_Project (accountId, projectId)
VALUES
    (3, 20240001),
    (4, 20240002);

INSERT INTO Log (actorId, action, target, targetId, field, value,currentActorRole)
VALUES
    -- Log User Creation
    ( 1, 'create', 'person', 2, 'First Name', 'Aron', 'ADMIN'),
    ( 1, 'create', 'person', 2, 'Email', 'aronsa@edu.aau.at', 'ADMIN'),
    ( 1, 'create', 'person', 2, 'Role', 'ADMIN', 'ADMIN'),
    ( 1, 'create', 'person', 2, 'Last Name', 'Sacherer', 'ADMIN'),
    ( 1, 'create', 'person', 2, 'Org Unit', 'Syssec', 'ADMIN'),
    ( 1, 'create', 'person', 3, 'First Name', 'John', 'ADMIN'),
    ( 1, 'create', 'person', 3, 'Email', 'john@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 3, 'Role', 'PROJECT MANAGER', 'ADMIN'),
    ( 1, 'create', 'person', 3, 'Last Name', 'Doe', 'ADMIN'),
    ( 1, 'create', 'person', 3, 'Org Unit', 'Datenschutz', 'ADMIN'),
    ( 1, 'create', 'person', 4, 'First Name', 'Max', 'ADMIN'),
    ( 1, 'create', 'person', 4, 'Email', 'max@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 4, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 4, 'Last Name', 'Mustermann', 'ADMIN'),
    ( 1, 'create', 'person', 4, 'Org Unit', 'Cybsec', 'ADMIN'),
    ( 1, 'create', 'person', 5, 'First Name', 'Alice', 'ADMIN'),
    ( 1, 'create', 'person', 5, 'Email', 'alice@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 5, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 5, 'Last Name', 'Smith', 'ADMIN'),
    ( 1, 'create', 'person', 5, 'Org Unit', 'Syssec', 'ADMIN'),
    ( 1, 'create', 'person', 6, 'First Name', 'Bob', 'ADMIN'),
    ( 1, 'create', 'person', 6, 'Email', 'bob@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 6, 'Role', 'PROJECT MANAGER', 'ADMIN'),
    ( 1, 'create', 'person', 6, 'Last Name', 'Johnson', 'ADMIN'),
    ( 1, 'create', 'person', 6, 'Org Unit', 'Semsys', 'ADMIN'),
    ( 1, 'create', 'person', 7, 'First Name', 'Charlie', 'ADMIN'),
    ( 1, 'create', 'person', 7, 'Email', 'charlie@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 7, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 7, 'Last Name', 'Brown', 'ADMIN'),
    ( 1, 'create', 'person', 7, 'Org Unit', 'Semsys', 'ADMIN'),
    ( 1, 'create', 'person', 8, 'First Name', 'Sarah', 'ADMIN'),
    ( 1, 'create', 'person', 8, 'Email', 'sarah@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 8, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 8, 'Last Name', 'Thompson', 'ADMIN'),
    ( 1, 'create', 'person', 8, 'Org Unit', 'Infsys', 'ADMIN'),
    ( 1, 'create', 'person', 9, 'First Name', 'Michael', 'ADMIN'),
    ( 1, 'create', 'person', 9, 'Email', 'michael@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 9, 'Role', 'PROJECT MANAGER', 'ADMIN'),
    ( 1, 'create', 'person', 9, 'Last Name', 'Rodriguez', 'ADMIN'),
    ( 1, 'create', 'person', 9, 'Org Unit', 'Syssec', 'ADMIN'),
    ( 1, 'create', 'person', 10, 'First Name', 'Daniel', 'ADMIN'),
    ( 1, 'create', 'person', 10, 'Email', 'daniel@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 10, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 10, 'Last Name', 'Martinez', 'ADMIN'),
    ( 1, 'create', 'person', 10, 'Org Unit', 'Prosys', 'ADMIN'),
    ( 1, 'create', 'person', 11, 'First Name', 'Jessica', 'ADMIN'),
    ( 1, 'create', 'person', 11, 'Email', 'jessica@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 11, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 11, 'Last Name', 'Lee', 'ADMIN'),
    ( 1, 'create', 'person', 11, 'Org Unit', 'Isbi', 'ADMIN'),
    ( 1, 'create', 'person', 12, 'First Name', 'Matthew', 'ADMIN'),
    ( 1, 'create', 'person', 12, 'Email', 'matthew@example.com', 'ADMIN'),
    ( 1, 'create', 'person', 12, 'Role', 'USER', 'ADMIN'),
    ( 1, 'create', 'person', 12, 'Last Name', 'Clark', 'ADMIN'),
    ( 1, 'create', 'person', 12, 'Org Unit', 'Prosys', 'ADMIN'),
    -- Log Project Creation
    ( 1, 'create', 'project', 20240001, 'Name', 'project1', 'ADMIN'),
    ( 1, 'create', 'project', 20240001, 'Description', 'Description for Project 1', 'ADMIN'),
    ( 1, 'create', 'project', 20240001, 'End Date', 'open Ended', 'ADMIN'),
    ( 1, 'create', 'project', 20240001, 'Added UserIDs', '3', 'ADMIN'),
    ( 1, 'create', 'project', 20240001, 'ManagerID', '1', 'ADMIN'),
    ( 1, 'create', 'project', 20240002, 'Name', 'project2', 'ADMIN'),
    ( 1, 'create', 'project', 20240002, 'Description', 'empty', 'ADMIN'),
    ( 1, 'create', 'project', 20240002, 'End Date', '2024-07-18', 'ADMIN'),
    ( 1, 'create', 'project', 20240002, 'Added UserIDs', '4', 'ADMIN'),
    ( 1, 'create', 'project', 20240002, 'ManagerID', '2', 'ADMIN');
    
    -- Indexes
    CREATE INDEX fullName ON staff (lastName, firstName);