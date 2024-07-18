USE dmsproject;

INSERT INTO orgUnit (name)
VALUES
    ('Datenschutz'),
    ('Syssec'),
    ('Cybsec'),
    ('Semsys'),
    ('Prosys'),
    ('Infsys'),
    ('Isbi');

-- user if account
-- project manager if referenced as manager in any project
-- deactivated if flag set in account
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

INSERT INTO Person (firstName, lastName, email)
VALUES
    ('Robert-Johann', 'Dienst', 'rodienst@edu.aau.at'),
    ('Aron', 'Sacherer', 'aronsa@edu.aau.at'),
    ('John', 'Doe', 'john@example.com'),
    ('Max', 'Mustermann', 'max@example.com'),
    ('Alice', 'Smith', 'alice@example.com'),
    ('Bob', 'Johnson', 'bob@example.com'),
    ('Charlie', 'Brown', 'charlie@example.com'),
    ('Sarah ', 'Thompson', 'sarah@example.com'),
    ('Michael', 'Rodriguez', 'michael@example.com'),
    ('Daniel', 'Martinez', 'daniel@example.com'),
    ('Jessica', 'Lee', 'jessica@example.com'),
    ('Matthew', 'Clark', 'matthew@example.com'),
    ('Olivia', 'Davis', 'olivia@example.com'), -- person without account
    ('Joshua', 'Wilson', 'joshua@example.com'); -- person without account

INSERT INTO Person_OrgUnit (personId, orgUnit)
VALUES
    (1, 'Syssec'),
    (2, 'Syssec'),
    (3, 'Datenschutz'),
    (4, 'Cybsec'),
    (5, 'Syssec'),
    (6, 'Semsys'),
    (7, 'Semsys'),
    (8, 'Infsys'),
    (9, 'Syssec'),
    (10, 'Prosys'),
    (11, 'Isbi'),
    (12, 'Prosys');

INSERT INTO Account (personId)
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

-- SET TIMESTAMP = UNIX_TIMESTAMP('2025-01-01'); -- set mysql session timestamp

-- INSERT INTO Project (name, description, managerId)
-- VALUES
--     ('project3', 'Project to test project id incrementation. Should be 2025....', 2);

-- SET TIMESTAMP = DEFAULT;

INSERT INTO Account_Project (accountId, projectId)
VALUES
    (3, 20240001),
    -- (3, 20250001),
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