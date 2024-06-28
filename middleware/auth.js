const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants/env');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
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
