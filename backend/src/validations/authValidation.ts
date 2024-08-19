import { body } from 'express-validator'

export const signInValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email address.'),
        body('password').isLength({ min: 8 }).withMessage('Password must be longer than 8 characters.')
    ];
}

export const signUpValidationRules = () => {
    return [
        body('pesel').isLength({ min: 11, max: 11 }).withMessage('PESEL must consist of 11 digits.'),
        body('email').isEmail().withMessage('Invalid email address.'),
        body('phoneNumber').isMobilePhone('pl-PL').withMessage('Invalid phone number.'),
        body('password').isLength({ min: 8 }).withMessage('Password must be longer than 8 characters.'),
        body('passwordConfirm').custom((value, { req }) => {
            return value === req.body.password;
        }).withMessage('Passwords do not match.'),
        body('firstName')
            .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters long.')
            .isAlpha().withMessage('First name must contain only letters')
            .custom(value => {
                if (value.charAt(0) !== value.charAt(0).toUpperCase()) return false;
                return true;
            }).withMessage('First name must start with an uppercase letter.'),
        body('lastName')
            .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters long.')
            .isAlpha().withMessage('Last name must contain only letters')
            .custom(value => {
                if (value.charAt(0) !== value.charAt(0).toUpperCase()) return false;
                return true;
            }).withMessage('Last name must start with an uppercase letter.')];
}

export const forgotPasswordValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Invalid email address.'),
    ];
}

export const resetPasswordValidationRules = () => {
    return [
        body('password').isLength({ min: 8 }).withMessage('New password must be longer than 8 characters.'),
    ];
}