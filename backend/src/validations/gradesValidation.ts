import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createIntValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const description: string = req.body.description;
        const grade: number = req.body.grade;

        if (!description && !grade)
            throw new Error('At least one field must be provided.')

        if (description) createNotEmptyValidation('description').run(req);
        if (grade) createNotEmptyValidation('grade').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};


export const validateCreateGrade = () => [
    createNotEmptyValidation('description'),
    createIntValidation('grade'),
    createNotEmptyValidation('studentId'),
    createNotEmptyValidation('subjectId'),
    createNotEmptyValidation('teacherId')
];

export const validateGetGrades = () => [
    createNotEmptyValidation('studentId', 'param'),
    createNotEmptyValidation('subjectId', 'param')
];

export const validateGetThreeLatestGrades = () => [
    createNotEmptyValidation('studentId', 'param')
];

export const validateUpdateGrade = () => [
    createNotEmptyValidation('gradeId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteGrade = () => [
    createNotEmptyValidation('gradeId', 'param')
];