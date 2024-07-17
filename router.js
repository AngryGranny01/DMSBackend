const express = require('express');
const router = express.Router();

const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/log.controller");
const { userValidationRules, projectValidationRules, validate } = require('./middleware/validation');
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - orgUnit
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               orgUnit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/users", userValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN']), userController.create);

/**
 * @swagger
 * /users/checkEmailExist:
 *   get:
 *     summary: Checks if an email already exists
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email check result
 *       400:
 *         description: Email is required
 *       500:
 *         description: Internal server error
 */
router.get("/users/checkEmailExist", authenticateToken, userController.checkIfEmailExist);

/**
 * @swagger
 * /user/{userID}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
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
 *     summary: Retrieve salt by email
 *     tags: [User]
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Salt value
 *       400:
 *         description: Email is required
 *       500:
 *         description: Internal server error
 */
router.get("/users/findSalt", userController.findSalt);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Internal server error
 */
router.get("/users", authenticateToken, authorizedRoles(['ADMIN', 'PROJECT MANAGER']), userController.getAllUsers);

/**
 * @swagger
 * /users/{userID}:
 *   delete:
 *     summary: Deletes a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User was deleted successfully
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
 *     summary: Updates a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userID
 *               - firstName
 *               - lastName
 *               - orgUnit
 *             properties:
 *               userID:
 *                 type: integer
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               orgUnit:
 *                 type: string
 *     responses:
 *       200:
 *         description: User was updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/users", userValidationRules(), validate, authenticateToken, userController.update);

/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: Updates a user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountID
 *               - passwordHash
 *               - salt
 *             properties:
 *               accountID:
 *                 type: integer
 *               passwordHash:
 *                 type: string
 *               salt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password was updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.put('/users/password', authenticateToken, userController.updateUserPassword);

/**
 * @swagger
 * /verifyToken:
 *   put:
 *     summary: Verify token and update password
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
 *         description: Password was updated successfully
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Token has expired
 *       500:
 *         description: Internal server error
 */
router.put("/verifyToken", userController.verifyToken);



//---------------------------------------------- Project Routes ----------------------------------------------//
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Creates a new project
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
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
 *               userIDs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userID:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Successfully created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/projects", projectValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN', 'PROJECT MANAGER']), projectController.create);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retrieves all projects
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *       500:
 *         description: Internal server error
 */
router.get("/projects", authenticateToken, authorizedRoles(['ADMIN']), projectController.findAll);

/**
 * @swagger
 * /projects/{userID}:
 *   get:
 *     summary: Retrieve all projects associated with a specific user
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's projects
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
 *     summary: Updates a project by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectID
 *               - projectName
 *               - managerID
 *             properties:
 *               projectID:
 *                 type: integer
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
 *                   type: object
 *                   properties:
 *                     userID:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Project was updated successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.put("/projects", projectValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN', 'PROJECT MANAGER']), projectController.update);

/**
 * @swagger
 * /projects:
 *   delete:
 *     summary: Deletes a project by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectID
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project was deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete("/projects", authenticateToken, authorizedRoles(['ADMIN', 'PROJECT MANAGER']), projectController.delete);


//---------------------------------------------- Log Routes ----------------------------------------------//
router.post('/logs', authenticateToken, logController.create);
router.get('/logs/project/:projectID', authenticateToken, logController.findProjectLogs);
router.get('/logs/user/:userID', authenticateToken, logController.findUserLogs);


router.get("/logs/lastLogins", authenticateToken, userController.lastLoginDates);


module.exports = router;

