import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createIntValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const topic: string = req.body.topic;
        const scope: string = req.body.scope;

        if (!topic && !scope)
            throw new Error('At least one field must be provided.')

        if (topic) createNotEmptyValidation('topic').run(req);
        if (scope) createNotEmptyValidation('scope').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateExam = () => [
    createNotEmptyValidation('topic'),
    createNotEmptyValidation('scope'),
    createNotEmptyValidation('lessonId'),
];

export const validateUserId = () => [
    createNotEmptyValidation('userId', 'param'),
];

export const validateUpdateExam = () => [
    createNotEmptyValidation('examId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteExam = () => [
    createNotEmptyValidation('examId', 'param')
];