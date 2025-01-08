import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateStatus = () => [
    createNotEmptyValidation('name'),
];

export const validateDeleteStatus = () => [
    createNotEmptyValidation('statusId', 'param')
];