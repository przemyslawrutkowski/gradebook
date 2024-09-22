import { createNotEmptyValidation, createIntValidation } from '../utils/validationHelpers';

export const validateSubjectName = () => [
    createNotEmptyValidation('name')
];

export const validateSubjectId = () => [
    createIntValidation('subjectId', 'param')
];