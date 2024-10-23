import { createDateValidation, createNotEmptyValidation, createArrayValidation, createIntValidation, createTimeValidation } from '../utils/validationHelpers';

export const validateGenerateLessons = () => [
    createDateValidation('startDate'),
    createDateValidation('endDate'),
    createNotEmptyValidation('teacherId', 'body'),
    createNotEmptyValidation('classId', 'body'),
    createNotEmptyValidation('subjectId', 'body'),
    createArrayValidation('lessonSchedules'),
    createIntValidation('lessonSchedules.*.dayOfWeek', 'body', 0, 6),
    createTimeValidation('lessonSchedules.*.startTime'),
    createTimeValidation('lessonSchedules.*.endTime'),
    createIntValidation('lessonSchedules.*.frequency', 'body', 1)
];

export const validateUpdateLesson = () => [
    createNotEmptyValidation('lessonId', 'param'),
    createNotEmptyValidation('description')
];

export const validateGetAndDeleteLessons = () => [
    createNotEmptyValidation('classId', 'param'),
    createNotEmptyValidation('subjectId', 'param')
];