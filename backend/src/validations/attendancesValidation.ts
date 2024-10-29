import { createArrayValidation, createBooleanValidation, createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateAttendances = () => [
    createArrayValidation('attendances'),
    createBooleanValidation('attendances.*.wasPresent'),
    createNotEmptyValidation('attendances.*.studentId'),
    createNotEmptyValidation('attendances.*.lessonId'),
];

export const validateGetAttendances = () => [
    createNotEmptyValidation('lessonId', 'param')
];

export const validateUpdateAttendance = () => [
    createNotEmptyValidation('studentId', 'param'),
    createNotEmptyValidation('lessonId', 'param'),
    createBooleanValidation('wasPresent')
];