import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateProblem = () => [
    createNotEmptyValidation('description'),
    createNotEmptyValidation('problemTypeId'),
    createNotEmptyValidation('reporterId'),
    createNotEmptyValidation('userTypeId')
];

export const validateGetProblemsByType = () => [
    createNotEmptyValidation('problemTypeId', 'param'),
];

export const validateUpdateProblem = () => [
    createNotEmptyValidation('problemId', 'param'),
    createNotEmptyValidation('statusId')
];

export const validateDeleteProblem = () => [
    createNotEmptyValidation('problemId', 'param')
];