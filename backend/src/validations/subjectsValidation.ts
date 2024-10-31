import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateSubjectName = () => [
    createNotEmptyValidation('name')
];

export const validateSubjectId = () => [
    createNotEmptyValidation('subjectId', 'param')
];

export const validateSubjectUpdate = () => [
    createNotEmptyValidation('subjectId', 'param'),
    createNotEmptyValidation('name')
];