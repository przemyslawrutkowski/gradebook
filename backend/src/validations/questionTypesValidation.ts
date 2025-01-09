import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateQuestionType = () => [
    createNotEmptyValidation('name'),
];

export const validateDeleteQuestionType = () => [
    createNotEmptyValidation('questionTypeId', 'param')
];