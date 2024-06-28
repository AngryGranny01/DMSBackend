const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email format'),
        body('firstName').notEmpty().withMessage('First Name must not be empty'),
        body('lastName').notEmpty().withMessage('Last Name must not be empty'),
        body('orgUnit').notEmpty().withMessage('Organizational Unit must not be empty'),
    ];
}

const validate = (req, res, next) => {
    const errors = validationResult(req);

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
