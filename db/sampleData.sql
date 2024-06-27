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
    ('admin');

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
    ('Peter', 'Schartner', 'peter.schartner@aau.at'),
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
    (1, 'admin');

UPDATE Account SET isDeactivated = true WHERE id IN(9, 10);

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

INSERT INTO Log (actorId, action, target, targetId, field, value)
VALUES
    ( 1, 'create', 'account', 2, NULL, NULL),
    ( 1, 'create', 'account', 3, NULL, NULL),
    ( 1, 'create', 'account', 4, NULL, NULL),
    ( 1, 'create', 'account', 5, NULL, NULL),
    ( 1, 'create', 'account', 6, NULL, NULL),
    ( 1, 'create', 'account', 7, NULL, NULL),
    ( 1, 'create', 'account', 8, NULL, NULL),
    ( 1, 'create', 'account', 9, NULL, NULL),
    ( 1, 'create', 'account', 10, NULL, NULL),
    ( 1, 'create', 'account', 11, NULL, NULL),
    ( 1, 'create', 'account', 12, NULL, NULL),
    ( 1, 'create', 'account', 13, NULL, NULL),
    ( 1, 'create', 'account', 14, NULL, NULL);

    