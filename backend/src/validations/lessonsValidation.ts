import { createDateValidation, createNotEmptyValidation, createArrayValidation, createIntValidation, createTimeValidation } from '../utils/validationHelpers';

export const validateCreateLessons = () => [
    createDateValidation('startDate'),
    createDateValidation('endDate'),
    createNotEmptyValidation('teacherId'),
    createNotEmptyValidation('classId'),
    createNotEmptyValidation('subjectId'),
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

export const validateClassAndSubjectIds = () => [
    createNotEmptyValidation('classId', 'param'),
    createNotEmptyValidation('subjectId', 'param')
];

export const validateDeleteLessonsByClassIdAndDate = () => [
    createNotEmptyValidation('classId', 'param'),
    createDateValidation('date', 'param')
];

export const validateDeleteLesson = () => [
    createNotEmptyValidation('lessonId', 'param'),
];

export const validateUserId = () => [
    createNotEmptyValidation('userId', 'param'),
];

export const validateClassId = () => [
    createNotEmptyValidation('classId', 'param'),
];