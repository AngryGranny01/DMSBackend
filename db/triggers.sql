USE dmsproject;

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
