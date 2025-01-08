import { body, param } from 'express-validator';

export const createVersionValidation = (field: string) => {
    return body(field).matches(/^\d+\.\d+\.\d+$/).withMessage(`${field} must be in MAJOR.MINOR.PATCH format.`);
};


export const createDateValidation = (field: string, location: 'body' | 'param' = 'body') => {
    const validator = location === 'body' ? body(field) : param(field);
    return validator.isDate().withMessage(`${field} must be a valid date in YYYY-MM-DD format.`);
};

export const createNotEmptyValidation = (field: string, location: 'body' | 'param' = 'body') => {
    const validator = location === 'body' ? body(field) : param(field);
    return validator.not().isEmpty({ ignore_whitespace: true }).withMessage(`${field} is required.`);
};

export const createArrayValidation = (field: string) =>
    body(field)
        .isArray({ min: 1 })
        .withMessage(`${field} must be a non-empty array.`);

export const createIntValidation = (field: string, location: 'body' | 'param' = 'body', min?: number, max?: number) => {
    const validator = location === 'body' ? body(field) : param(field);
    const options: {
        min?: number,
        max?: number
    } = {};
    const intValidator = validator.isInt(options);
    if (min !== undefined) options.min = min;
    if (max !== undefined) options.max = max;
    return intValidator.withMessage(`${field} must be an integer${min !== undefined ? ` between ${min}` : ''}${max !== undefined ? ` and ${max}` : ''}.`);
};

export const createTimeValidation = (field: string) =>
    body(field)
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage(`${field} must be in HH:MM format.`);

export const createBooleanValidation = (field: string) =>
    body(field)
        .isBoolean()
        .withMessage(`${field} must be a boolean.`)

export const emailValidation =
    body('email')
        .isEmail()
        .withMessage('Invalid email.');

export const passwordValidation =
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters.');

export const peselValidation = body('pesel')
    .isLength({ min: 11, max: 11 })
    .withMessage('PESEL must be 11 digits.')
    .isNumeric({ no_symbols: true })
    .withMessage('PESEL must contain only numeric characters.');

export const phoneNumberValidation =
    body('phoneNumber')
        .isMobilePhone('pl-PL')
        .withMessage('Invalid phone number.');

export const passwordConfirmValidation =
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match.');

export const createNameValidation = (field: string) => [
    body(field)
        .isLength({ min: 2, max: 50 }).withMessage(`${field} must be 2-50 characters.`)
        .isAlpha().withMessage(`${field} must contain only letters.`)
];