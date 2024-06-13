const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ];
}

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
}

module.exports = {
    userValidationRules,
    validate
};
