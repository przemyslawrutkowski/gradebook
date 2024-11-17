import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createDateValidation, createIntValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom(async (value, { req }) => {
        const semester: number | undefined = req.body.semester;
        const startDate: string | undefined = req.body.startDate;
        const endDate: string | undefined = req.body.endDate;

        if (!semester && !startDate && !endDate) {
            throw new Error('At least one field must be provided.')
        }

        const validations = [];

        if (semester) validations.push(createNotEmptyValidation('semester').run(req));
        if (startDate) validations.push(createDateValidation('startDate').run(req));
        if (endDate) validations.push(createDateValidation('endDate').run(req));

        await Promise.all(validations);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateSemester = () => [
    createIntValidation('semester'),
    createDateValidation('startDate'),
    createDateValidation('endDate'),
    createNotEmptyValidation('schoolYearId'),
];

export const validateGetSemesters = () => [
    createNotEmptyValidation('schoolYearId', 'param'),
];

export const validateUpdateSemester = () => [
    createNotEmptyValidation('semesterId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteSemester = () => [
    createNotEmptyValidation('semesterId', 'param'),
];
