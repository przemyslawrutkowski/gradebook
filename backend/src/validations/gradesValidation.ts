import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createIntValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const description: string = req.body.description;
        const grade: number = req.body.grade;
        const weight: number = req.body.weight;

        if (!description && !grade && !weight)
            throw new Error('At least one field must be provided.')

        if (description) createNotEmptyValidation('description').run(req);
        if (grade) createIntValidation('grade', 'body', 1, 6).run(req);
        if (weight) createIntValidation('weight', 'body', 1, 3).run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateGrade = () => [
    createNotEmptyValidation('description'),
    createIntValidation('grade', 'body', 1, 6),
    createIntValidation('weight', 'body', 1, 3),
    createNotEmptyValidation('studentId'),
    createNotEmptyValidation('subjectId'),
    createNotEmptyValidation('teacherId')
];

export const validateCreateFinalGrade = () => [
    createIntValidation('grade', 'body', 1, 6),
    createNotEmptyValidation('studentId'),
    createNotEmptyValidation('subjectId'),
    createNotEmptyValidation('teacherId'),
    createNotEmptyValidation('semesterId'),
];

export const validateGetGrades = () => [
    createNotEmptyValidation('studentId', 'param'),
    createNotEmptyValidation('subjectId', 'param')
];

export const validateStudentId = () => [
    createNotEmptyValidation('studentId', 'param')
];

export const validateUpdateGrade = () => [
    createNotEmptyValidation('gradeId', 'param'),
    atLeastOneFieldValidation()
];

export const validateUpdateFinalGrade = () => [
    createNotEmptyValidation('gradeId', 'param'),
    createIntValidation('grade', 'body', 1, 6),
];

export const validateDeleteGrade = () => [
    createNotEmptyValidation('gradeId', 'param')
];