import { createNotEmptyValidation, createIntValidation } from './validationUtils';

export const validateSubjectName = () => [
    createNotEmptyValidation('name')
];

export const validateSubjectId = () => [
    createIntValidation('subjectId', 'param')
];