import { body, Result, validationResult } from 'express-validator';
import { createIntValidation, createNotEmptyValidation } from './validationUtils';

const classIdValidation = createIntValidation('classId', 'param');
const studentIdValidation = createIntValidation('studentId');
const teacherIdValidation = createIntValidation('teacherId');
const nameValidation = createNotEmptyValidation('name');
const yearbookValidation = createNotEmptyValidation('yearbook');

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const name: string = req.body.name;
        const yearbook: string = req.body.yearbook;
        const teacherId = Number(req.body.teacherId);

        if (!name && !yearbook && !teacherId)
            throw new Error('At least one field must be provided.')

        if (name) nameValidation.run(req);
        if (yearbook) yearbookValidation.run(req);
        if (teacherId) teacherIdValidation.run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};


export const validateCreateClass = () => [
    nameValidation,
    yearbookValidation
];

export const validateAssignStudent = () => [
    classIdValidation,
    studentIdValidation
];

export const validateClassUpdate = () => [
    classIdValidation,
    atLeastOneFieldValidation(),
];

export const validateClassId = () => [
    classIdValidation
];