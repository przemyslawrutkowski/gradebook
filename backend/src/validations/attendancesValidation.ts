import { createArrayValidation, createBooleanValidation, createDateValidation, createNotEmptyValidation } from '../utils/validationHelpers';

export const validateCreateAttendances = () => [
    createArrayValidation('attendances'),
    createNotEmptyValidation('lessonId'),
    createBooleanValidation('attendances.*.wasPresent'),
    createBooleanValidation('attendances.*.wasLate'),
    createBooleanValidation('attendances.*.wasExcused'),
    createNotEmptyValidation('attendances.*.studentId')
];

export const validateGetAttendances = () => [
    createNotEmptyValidation('lessonId', 'param')
];

export const validateStudentId = () => [
    createNotEmptyValidation('studentId', 'param')
];

export const validateGetClassAttendances = () => [
    createNotEmptyValidation('classId', 'param')
];

export const validateGetAttendancesByDate = () => [
    createNotEmptyValidation('studentId', 'param'),
    createDateValidation('date', 'param')
];

export const validateUpdateAttendances = () => [
    createArrayValidation('attendancesUpdate'),
    createNotEmptyValidation('attendancesUpdate.*.id'),
    createBooleanValidation('attendancesUpdate.*.wasPresent'),
    createBooleanValidation('attendancesUpdate.*.wasLate'),
    createBooleanValidation('attendancesUpdate.*.wasExcused')
];