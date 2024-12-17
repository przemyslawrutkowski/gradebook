import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateClassName = () => [
    createNotEmptyValidation('name')
];

export const validateUpdateClassName = () => [
    createNotEmptyValidation('classNameId', 'param'),
    createNotEmptyValidation('name')
];

export const validateDeleteClassName = () => [
    createNotEmptyValidation('classNameId', 'param')
];