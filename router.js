const express = require('express');
const router = express.Router();

const projectController = require("./controllers/project.controller");
const userController = require("./controllers/user.controller");
const logController = require("./controllers/logProject.controller");
const logUserController = require("./controllers/logUser.controller");
const projectManagerController = require("./controllers/projectManager.controller");
const { userValidationRules, validate } = require('./middleware/validation');

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
router.post("/users", userValidationRules(), validate, userController.create);

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
router.get("/users/checkEmailExist", userController.checkIfEmailExist);

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
router.get("/users/checkUsernameExist", userController.checkIfUsernameExist);

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
router.get("/user/:userID", userController.findOne);

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
router.get("/users", userController.getAllUsers);

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
router.delete("/users/:userID", userController.delete);

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
router.put("/users", userController.update);

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

// Project routes
router.post("/projects", projectController.create);
router.get("/projects", projectController.findAll);
router.get("/projects/:userID", projectController.findUserProjects);
router.put("/projects", projectController.update);
router.delete("/projects", projectController.delete);

// Project Manager routes
router.put("/projectManager", projectManagerController.update);
router.get("/projectAdminAndManager/passwords/:id", projectManagerController.findManagerAndAdminPassword);
router.delete("/projectManager", projectManagerController.delete);

// Log User routes
router.post("/user-logs", logUserController.create);
router.get("/user-logs/:userID", logUserController.findUserLogs);
router.get("/user-logs/lastLogins/:userID", logUserController.lastLoginDates);

// Log Project routes
router.post("/project-logs", logController.create);
router.get("/project-logs/:projectID", logController.findProjectLogs);

module.exports = router;
