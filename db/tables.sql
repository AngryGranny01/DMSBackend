CREATE DATABASE IF NOT EXISTS dmsproject;

USE dmsproject;

CREATE TABLE IF NOT EXISTS OrgUnit (name VARCHAR(255) PRIMARY KEY);

CREATE TABLE IF NOT EXISTS Staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
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

CREATE TABLE IF NOT EXISTS OrgUnit (
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Person_OrgUnit (
    personId INT NOT NULL,
    orgUnit VARCHAR(255) NOT NULL,
    PRIMARY KEY (personId, orgUnit),
    FOREIGN KEY (personId) REFERENCES Person(id) ON DELETE CASCADE,
    FOREIGN KEY (orgUnit) REFERENCES OrgUnit(name) ON UPDATE CASCADE
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
    -- ! not null necessary? (admin has access anyways..)
    templateId INT UNIQUE,
    FOREIGN KEY (managerId) REFERENCES Account(id),
    -- ! does mysql allow SET DEFAULT? -- rollback on cascade here?
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