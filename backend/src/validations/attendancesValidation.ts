import { createArrayValidation, createBooleanValidation, createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateAttendances = () => [
    createArrayValidation('attendances'),
    createNotEmptyValidation('lessonId'),
    createBooleanValidation('attendances.*.wasPresent'),
    createBooleanValidation('attendances.*.wasLate'),
    createNotEmptyValidation('attendances.*.studentId'),
];

export const validateGetAttendances = () => [
    createNotEmptyValidation('lessonId', 'param')
];


export const validateGetAttendancesInformations = () => [
    createNotEmptyValidation('studentId', 'param')
];

export const validateUpdateAttendance = () => [
    createNotEmptyValidation('attendanceId', 'param'),
    createBooleanValidation('wasPresent'),
    createBooleanValidation('wasLate')
];