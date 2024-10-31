import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateUserTypeName = () => [
    createNotEmptyValidation('name')
];

export const validateUserTypeId = () => [
    createNotEmptyValidation('userTypeId', 'param')
];