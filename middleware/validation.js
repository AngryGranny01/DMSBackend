const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email format'),
        body('userName').notEmpty().withMessage('Username must not be empty'),
    ];
}

const validate = (req, res, next) => {
    const errors = validationResult(req);
    console.log("Validation triggered");
    if (errors.isEmpty()) {
        return next();
    }
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
}

module.exports = {
    userValidationRules,
    validate
};
