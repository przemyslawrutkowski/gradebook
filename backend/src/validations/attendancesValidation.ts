import { createArrayValidation, createBooleanValidation, createIntValidation } from '../utils/validationHelpers';

export const validateCreateAttendances = () => [
    createArrayValidation('attendances'),
    createBooleanValidation('attendances.*.wasPresent'),
    createIntValidation('attendances.*.studentId'),
    createIntValidation('attendances.*.lessonId'),
    createIntValidation('lessonId', 'param'),
    createIntValidation('studentId', 'param')
];

export const validateGetAttendances = () => [
    createIntValidation('lessonId', 'param')
];

export const validateUpdateAttendance = () => [
    createIntValidation('studentId', 'param'),
    createIntValidation('lessonId', 'param'),
    createBooleanValidation('wasPresent')
];