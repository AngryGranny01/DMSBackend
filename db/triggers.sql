USE dmsproject;

-- Sets projectId on insert of new project in the format YYYY%04d, where YYYY represents the current year and %04d are the first 4 digits of the counter of this year's projects (e.g. 20240023 for the 23. project in 2024)
DELIMITER $$

CREATE OR ALTER TRIGGER before_project_insert_check_id
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


DELIMITER $$
CREATE TRIGGER before_log_insert
BEFORE INSERT ON Log
FOR EACH ROW
BEGIN
    IF NEW.target = 'Person' THEN
        IF NOT EXISTS (SELECT 1 FROM Person WHERE id = NEW.targetId) THEN
            SIGNAL SQLSTATE '23000'
            SET MESSAGE_TEXT = 'Invalid targetId for target Person';
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
END$$
DELIMITER;
