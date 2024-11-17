import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateUserType = () => [
    createNotEmptyValidation('name')
];

export const validateDeleteUserType = () => [
    createNotEmptyValidation('userTypeId', 'param')
];