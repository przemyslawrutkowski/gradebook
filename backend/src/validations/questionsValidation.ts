import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateUpdateQuestion = () => [
    createNotEmptyValidation('questionId'),
    createNotEmptyValidation('content')
];

export const validateDeleteQuestion = () => [
    createNotEmptyValidation('questionId', 'param')
];