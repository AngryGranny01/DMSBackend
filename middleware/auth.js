const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants/env');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log("No token provided");
        return res.sendStatus(401); // 401 Unauthorized if no token is present
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token verification failed:", err);
            return res.sendStatus(403); // 403 Forbidden if token is invalid
        }
        req.user = user;
        next();
    });
}

function authorizedRoles(allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.sendStatus(403); // 403 Forbidden if user lacks the required role
        }
        next();
    };
}

module.exports = { authenticateToken, authorizedRoles };
