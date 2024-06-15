const express = require('express');
const router = express.Router();

const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/logProject.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");
const { userValidationRules, validate } = require('./middleware/validation');
const authenticateToken = require('./middleware/auth');

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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/users", userValidationRules(), validate, authenticateToken, userController.create);

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
 * /users/checkUsernameExist:
 *   get:
 *     summary: Checks if username exists
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Username checked successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Username not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/checkUsernameExist", authenticateToken, userController.checkIfUsernameExist);

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
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/user/:userID", authenticateToken, userController.findOne);

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
 *       500:
 *         description: Internal server error
 */
router.get("/users", authenticateToken, userController.getAllUsers);

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
router.delete("/users/:userID", authenticateToken, userController.delete);

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
 *               - email
 *             properties:
 *               userID:
 *                 type: string
 *               email:
 *                 type: string
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
router.put("/users", authenticateToken, userController.update);

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
 *             properties:
 *               token:
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
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/projects",authenticateToken, projectController.create);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/projects",authenticateToken, projectController.findAll);

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
 *       404:
 *         description: Projects not found
 *       500:
 *         description: Internal server error
 */
router.get("/projects/:userID",authenticateToken, projectController.findUserProjects);

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
router.put("/projects", authenticateToken,projectController.update);

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
router.delete("/projects", authenticateToken,projectController.delete);

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
router.put("/projectManager", authenticateToken,projectManagerController.update);

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
 *       404:
 *         description: Manager not found
 *       500:
 *         description: Internal server error
 */
router.get("/projectManager/:id", authenticateToken,projectManagerController.findManagerID);

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
router.delete("/projectManager", authenticateToken,projectManagerController.delete);


//---------------------------------------------- Log Routes ----------------------------------------------//
/**
 * @swagger
 * /user-logs:
 *   post:
 *     summary: Create a user log
 *     tags: [LogUser]
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
 *     responses:
 *       201:
 *         description: User log created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/user-logs", authenticateToken,logUserController.create);

/**
 * @swagger
 * /user-logs/{userID}:
 *   get:
 *     summary: Get user logs by user ID
 *     tags: [LogUser]
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
 *       404:
 *         description: User logs not found
 *       500:
 *         description: Internal server error
 */
router.get("/user-logs/:userID", authenticateToken,logUserController.findUserLogs);

/**
 * @swagger
 * /user-logs/lastLogins/{userID}:
 *   get:
 *     summary: Get last login dates by user ID
 *     tags: [LogUser]
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Last login dates retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/user-logs/lastLogins/:userID", authenticateToken,logUserController.lastLoginDates);

/**
 * @swagger
 * /project-logs:
 *   post:
 *     summary: Create a project log
 *     tags: [LogProject]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectID
 *               - userID
 *               - activityName
 *               - activityDescription
 *             properties:
 *               projectID:
 *                 type: integer
 *               userID:
 *                 type: integer
 *               activityName:
 *                 type: string
 *               activityDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project log created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/project-logs", authenticateToken,logController.create);

/**
 * @swagger
 * /project-logs/{projectID}:
 *   get:
 *     summary: Get project logs by project ID
 *     tags: [LogProject]
 *     parameters:
 *       - in: path
 *         name: projectID
 *         schema:
 *           type: integer
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project logs retrieved successfully
 *       404:
 *         description: Project logs not found
 *       500:
 *         description: Internal server error
 */
router.get("/project-logs/:projectID", authenticateToken,logController.findProjectLogs);

module.exports = router;
