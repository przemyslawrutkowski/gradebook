import { createDateValidation, createNotEmptyValidation, createArrayValidation, createIntValidation, createTimeValidation } from './validationUtils';

export const validateGenerateLessons = () => [
    createDateValidation('startDate'),
    createDateValidation('endDate'),
    createIntValidation('teacherId', 'body'),
    createIntValidation('classId', 'body'),
    createIntValidation('subjectId', 'body'),
    createArrayValidation('lessonSchedules'),
    createIntValidation('lessonSchedules.*.dayOfWeek', 'body', 0, 6),
    createTimeValidation('lessonSchedules.*.startTime'),
    createTimeValidation('lessonSchedules.*.endTime'),
    createIntValidation('lessonSchedules.*.frequency', 'body', 1)
];

export const validateUpdateLesson = () => [
    createIntValidation('id', 'param'),
    createNotEmptyValidation('description')
];

export const validateDeleteLessons = () => [
    createIntValidation('classId', 'param'),
    createIntValidation('subjectId', 'param')
];