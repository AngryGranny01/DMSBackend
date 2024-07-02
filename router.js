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


router.post("/users", userValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN']), userController.create);


router.get("/users/checkEmailExist", authenticateToken, userController.checkIfEmailExist);


router.get("/user/:userID", authenticateToken, authorizedRoles(['ADMIN']), userController.findOne);


router.get("/users/findSalt", userController.findSalt);


router.get("/users", authenticateToken, authorizedRoles(['ADMIN']), userController.getAllUsers);



router.delete("/users/:userID", authenticateToken, authorizedRoles(['ADMIN']), userController.delete);



router.put("/users", userValidationRules(), validate, authenticateToken, userController.update);


router.put('/users/password', authenticateToken, userController.updateUserPassword);


router.put("/verifyToken", userController.verifyToken);



//---------------------------------------------- Project Routes ----------------------------------------------//
router.post("/projects", projectValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.create);



router.get("/projects", authenticateToken, authorizedRoles(['ADMIN']), projectController.findAll);


router.get("/projects/:userID", authenticateToken, projectController.findUserProjects);


router.put("/projects", projectValidationRules(), validate, authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.update);

router.delete("/projects", authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.delete);



router.put("/project/projectManager", authenticateToken, authorizedRoles(['ADMIN', 'PROJECT_MANAGER']), projectController.updateManagerID);


//---------------------------------------------- Log Routes ----------------------------------------------//
router.post('/logs', authenticateToken, logController.create);
router.get('/logs/project/:projectID', authenticateToken, logController.findProjectLogs);
router.get('/logs/user/:userID', authenticateToken, logController.findUserLogs);


router.get("/logs/lastLogins", authenticateToken, userController.lastLoginDates);


module.exports = router;

