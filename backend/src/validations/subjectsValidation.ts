import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateSubject = () => [
    createNotEmptyValidation('name')
];

export const validateDeleteSubject = () => [
    createNotEmptyValidation('subjectId', 'param')
];

export const validateUpdateSubject = () => [
    createNotEmptyValidation('subjectId', 'param'),
    createNotEmptyValidation('name')
];