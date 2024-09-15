import { body } from 'express-validator';
import { createIntValidation, createNotEmptyValidation } from './validationUtils';

const classIdValidation = createIntValidation('classId', 'param');
const studentIdValidation = createIntValidation('studentId');
const nameValidation = createNotEmptyValidation('name');
const yearbookValidation = createNotEmptyValidation('yearbook');

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
    nameValidation.if(body('yearbook').isEmpty()),
    yearbookValidation.if(body('name').isEmpty())
];

export const validateClassId = () => [
    classIdValidation
];