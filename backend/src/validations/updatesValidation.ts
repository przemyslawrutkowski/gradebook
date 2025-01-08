import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createVersionValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const description: string = req.body.description;
        const version: string = req.body.version;

        if (!description && !version)
            throw new Error('At least one field must be provided.')

        if (description) createNotEmptyValidation('description').run(req);
        if (version) createVersionValidation('version').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateUpdate = () => [
    createNotEmptyValidation('description'),
    createVersionValidation('version')
];

export const validateUpdateUpdate = () => [
    createNotEmptyValidation('updateId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteUpdate = () => [
    createNotEmptyValidation('updateId', 'param')
];