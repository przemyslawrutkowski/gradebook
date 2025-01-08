import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateProblemType = () => [
    createNotEmptyValidation('name'),
];

export const validateDeleteProblemType = () => [
    createNotEmptyValidation('problemTypeId', 'param')
];