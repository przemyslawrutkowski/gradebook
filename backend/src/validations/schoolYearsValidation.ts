import { body, validationResult } from 'express-validator';
import { createDateValidation, createNotEmptyValidation, createArrayValidation, createIntValidation, createTimeValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom(async (value, { req }) => {
        const name: string = req.body.name;
        const startDate: string = req.body.startDate;
        const endDate: string = req.body.endDate;

        if (!name && !startDate && !endDate) {
            throw new Error('At least one field must be provided.');
        }

        const validations = [];

        if (name) validations.push(createNotEmptyValidation('name').run(req));
        if (startDate) validations.push(createDateValidation('startDate').run(req));
        if (endDate) validations.push(createDateValidation('endDate').run(req));

        await Promise.all(validations);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateSchoolYear = () => [
    createNotEmptyValidation('name'),
    createDateValidation('startDate'),
    createDateValidation('endDate')
];

export const validateUpdateSchoolYear = () => [
    createNotEmptyValidation('schoolYearId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteSchoolYear = () => [
    createNotEmptyValidation('schoolYearId', 'param'),
];