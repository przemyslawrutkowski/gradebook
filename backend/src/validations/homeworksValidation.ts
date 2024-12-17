import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createDateValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const description: string = req.body.description;
        const deadline: string = req.body.deadline;

        if (!description && !deadline)
            throw new Error('At least one field must be provided.')

        if (description) createNotEmptyValidation('description').run(req);
        if (deadline) createDateValidation('deadline').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};


export const validateCreateHomework = () => [
    createNotEmptyValidation('description'),
    createDateValidation('deadline'),
    createNotEmptyValidation('lessonId'),
];

export const validateGetHomework = () => [
    createNotEmptyValidation('lessonId', 'param')
];

export const validateGetLatestHomework = () => [
    createNotEmptyValidation('studentId', 'param')
];

export const validateUpdateHomework = () => [
    createNotEmptyValidation('homeworkId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteHomework = () => [
    createNotEmptyValidation('homeworkId', 'param')
];
