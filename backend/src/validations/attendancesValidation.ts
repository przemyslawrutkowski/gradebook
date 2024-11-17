import { createArrayValidation, createBooleanValidation, createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateAttendances = () => [
    createArrayValidation('attendances'),
    createNotEmptyValidation('lessonId'),
    createBooleanValidation('attendances.*.wasPresent'),
    createNotEmptyValidation('attendances.*.studentId'),
];

export const validateGetAttendances = () => [
    createNotEmptyValidation('lessonId', 'param')
];

export const validateUpdateAttendance = () => [
    createNotEmptyValidation('attendanceId', 'param'),
    createBooleanValidation('wasPresent')
];