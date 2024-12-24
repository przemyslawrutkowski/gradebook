import { createNotEmptyValidation } from '../utils/validationHelpers';

export const validateEventTypeName = () => [
    createNotEmptyValidation('name'),
];

export const validateEventTypeId = () => [
    createNotEmptyValidation('eventTypeId', 'param'),
];

export const validateEventTypeUpdate = () => [
    createNotEmptyValidation('eventTypeId', 'param'),
    createNotEmptyValidation('name')
];