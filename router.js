const express = require('express');
const router = express.Router();

const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/log.controller");
const projectManagerController = require("./controllers/projectManager.controller");
const { userValidationRules, validate } = require('./middleware/validation');
const { authenticateToken, authorizedRoles } = require('./middleware/auth');

//---------------------------------------------- User Routes ----------------------------------------------//
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Logs in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - passwordPlain
 *             properties:
 *               email:
 *                 type: string
 *               passwordPlain:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Creates a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - firstName
 *               - lastName
 *               - email
 *               - orgUnit
 *               - role
 *             properties:
 *               userName:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               orgUnit:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum:
 *                   - USER
 *                   - PROJECT_MANAGER
 *                   - ADMIN
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/users",  userValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN']), userController.create);

/**
 * @swagger
 * /users/checkEmailExist:
 *   get:
 *     summary: Checks if email exists
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email to check
 *     responses:
 *       200:
 *         description: Email checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exist:
 *                   type: boolean
 *                   description: Indicates whether the email exists
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Email not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/checkEmailExist", authenticateToken, userController.checkIfEmailExist);



/**
 * @swagger
 * /user/{userID}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: integer
 *                 userName:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 orgUnit:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum:
 *                     - USER
 *                     - PROJECT_MANAGER
 *                     - ADMIN
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/user/:userID", authenticateToken, authorizedRoles(['ADMIN']), userController.findOne);


/**
 * @swagger
 * /users/findSalt:
 *   get:
 *     summary: Finds the salt for a given email
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email to find the salt for
 *     responses:
 *       200:
 *         description: Salt found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salt:
 *                   type: string
 *                   description: The salt associated with the given email
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Salt not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/findSalt", userController.findSalt);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userID:
 *                     type: integer
 *                   userName:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   salt:
 *                     type: string
 *                   orgUnit:
 *                     type: string
 *                   passwordHash:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum:
 *                       - USER
 *                       - PROJECT_MANAGER
 *                       - ADMIN
 *       500:
 *         description: Internal server error
 */
router.get("/users", authenticateToken, authorizedRoles(['ADMIN']), userController.getAllUsers);


/**
 * @swagger
 * /users/{userID}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:userID", authenticateToken, authorizedRoles(['ADMIN']), userController.delete);


/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userID
 *               - userName
 *               - firstName
 *               - lastName
 *               - email
 *               - orgUnit
 *               - role
 *             properties:
 *               userID:
 *                 type: string
 *               userName:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               orgUnit:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum:
 *                   - USER
 *                   - PROJECT_MANAGER
 *                   - ADMIN
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/users", authenticateToken, authorizedRoles(['ADMIN']), userController.update);


/**
 * @swagger
 * /verifyToken:
 *   put:
 *     summary: Verify a token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - passwordHash
 *               - salt
 *             properties:
 *               token:
 *                 type: string
 *               passwordHash:
 *                 type: string
 *               salt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Internal server error
 */
router.put("/verifyToken", userController.verifyToken);



//---------------------------------------------- Project Routes ----------------------------------------------//
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - projectDescription
 *               - projectEndDate
 *               - managerID
 *               - userIDs
 *             properties:
 *               projectName:
 *                 type: string
 *               projectDescription:
 *                 type: string
 *               projectEndDate:
 *                 type: string
 *                 format: date
 *               managerID:
 *                 type: integer
 *               userIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/projects",  authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.create);


/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectID:
 *                     type: integer
 *                   projectName:
 *                     type: string
 *                   projectDescription:
 *                     type: string
 *                   projectEndDate:
 *                     type: string
 *                     format: date
 *                   managerID:
 *                     type: integer
 *                   manager:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       orgUnit:
 *                         type: string
 *                   users:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userID:
 *                           type: integer
 *                         userName:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         orgUnit:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get("/projects",  authenticateToken, authorizedRoles(['ADMIN']), projectController.findAll);


/**
 * @swagger
 * /projects/{userID}:
 *   get:
 *     summary: Get projects for a user
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectID:
 *                     type: integer
 *                   projectName:
 *                     type: string
 *                   projectDescription:
 *                     type: string
 *                   projectEndDate:
 *                     type: string
 *                     format: date
 *                   managerID:
 *                     type: integer
 *                   manager:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       orgUnit:
 *                         type: string
 *                   users:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userID:
 *                           type: integer
 *                         userName:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         orgUnit:
 *                           type: string
 *       404:
 *         description: Projects not found
 *       500:
 *         description: Internal server error
 */
router.get("/projects/:userID", authenticateToken, projectController.findUserProjects);


/**
 * @swagger
 * /projects:
 *   put:
 *     summary: Update a project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectID
 *               - projectName
 *               - projectDescription
 *               - projectEndDate
 *               - managerID
 *               - userIDs
 *             properties:
 *               projectID:
 *                 type: string
 *               projectName:
 *                 type: string
 *               projectDescription:
 *                 type: string
 *               projectEndDate:
 *                 type: string
 *                 format: date
 *               managerID:
 *                 type: integer
 *               userIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.put("/projects", authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.update);


/**
 * @swagger
 * /projects:
 *   delete:
 *     summary: Delete a project
 *     tags: [Project]
 *     parameters:
 *       - in: query
 *         name: projectID
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete("/projects",  authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']),projectController.delete);


/**
 * @swagger
 * /projectManager:
 *   put:
 *     summary: Update a project manager
 *     tags: [ProjectManager]
 *     parameters:
 *       - in: query
 *         name: userID
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: managerID
 *         schema:
 *           type: integer
 *         required: true
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: Project manager updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project manager not found
 *       500:
 *         description: Internal server error
 */
router.put("/projectManager", authenticateToken, projectManagerController.update);

/**
 * @swagger
 * /projectManager/{id}:
 *   get:
 *     summary: Get manager ID by user ID
 *     tags: [ProjectManager]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Manager ID retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 managerID:
 *                   type: integer
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Internal server error
 */
router.get("/projectManager/:id", authenticateToken, projectManagerController.findManagerID);

/**
 * @swagger
 * /projectManager:
 *   delete:
 *     summary: Delete a project manager
 *     tags: [ProjectManager]
 *     parameters:
 *       - in: query
 *         name: managerID
 *         schema:
 *           type: integer
 *         required: true
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: Project manager deleted successfully
 *       404:
 *         description: Project manager not found
 *       500:
 *         description: Internal server error
 */
router.delete("/projectManager", authenticateToken, projectManagerController.delete);


//---------------------------------------------- Log Routes ----------------------------------------------//
/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Create a log entry
 *     tags: [Log]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userID
 *               - activityName
 *               - activityDescription
 *             properties:
 *               userID:
 *                 type: integer
 *               activityName:
 *                 type: string
 *               activityDescription:
 *                 type: string
 *               projectID:
 *                 oneOf:
 *                   - type: string
 *                   - type: null
 *                   - type: undefined
 *     responses:
 *       201:
 *         description: User log created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/logs", authenticateToken, logController.create);


/**
 * @swagger
 * /logs/user/{userID}:
 *   get:
 *     summary: Get user logs by user ID
 *     tags: [Log]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   logID:
 *                     type: integer
 *                   userID:
 *                     type: integer
 *                   activityName:
 *                     type: string
 *                   activityDescription:
 *                     type: string
 *                   timeStamp:
 *                     type: string
 *                     format: date-time
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *       404:
 *         description: User logs not found
 *       500:
 *         description: Internal server error
 */
router.get("/logs/user/:userID", authenticateToken, logController.findUserLogs);


/**
 * @swagger
 * /logs/lastLogins:
 *   get:
 *     summary: Get last login dates for all users
 *     tags: [Log]
 *     responses:
 *       200:
 *         description: Last login dates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userID:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get("/logs/lastLogins", authenticateToken, logController.lastLoginDates);



/**
 * @swagger
 * /logs/project/{projectID}:
 *   get:
 *     summary: Get project logs by project ID
 *     tags: [Log]
 *     parameters:
 *       - in: path
 *         name: projectID
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   logUserID:
 *                     type: integer
 *                   projectID:
 *                     type: integer
 *                   userID:
 *                     type: integer
 *                   activityName:
 *                     type: string
 *                   activityDescription:
 *                     type: string
 *                   timeStamp:
 *                     type: string
 *                     format: date-time
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *       404:
 *         description: Project logs not found
 *       500:
 *         description: Internal server error
 */
router.get("/logs/project/:projectID", authenticateToken, logController.findProjectLogs);

module.exports = router;

