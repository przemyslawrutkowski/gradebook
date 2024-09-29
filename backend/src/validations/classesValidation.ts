import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const name: string = req.body.name;
        const yearbook: string = req.body.yearbook;
        const teacherId: string = req.body.teacherId;

        if (!name && !yearbook && !teacherId)
            throw new Error('At least one field must be provided.')

        if (name) createNotEmptyValidation('name').run(req);
        if (yearbook) createNotEmptyValidation('yearbook').run(req);
        if (teacherId) createNotEmptyValidation('teacherId').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};


export const validateCreateClass = () => [
    createNotEmptyValidation('name'),
    createNotEmptyValidation('yearbook')
];

export const validateAssignStudent = () => [
    createNotEmptyValidation('classId', 'param'),
    createNotEmptyValidation('studentId')
];

export const validateClassUpdate = () => [
    createNotEmptyValidation('classId', 'param'),
    atLeastOneFieldValidation(),
];

export const validateClassId = () => [
    createNotEmptyValidation('classId', 'param')
];