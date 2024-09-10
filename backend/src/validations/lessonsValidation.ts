import { body } from "express-validator";

export const lessonsGenerationValidationRules = () => {
    return [
        body('startDate').isDate().withMessage('Start date must be a valid date in UTC format.'),
        body('endDate').isDate().withMessage('End date must be a valid date in UTC format.'),
        body('teacherId').notEmpty().withMessage('Teacher id is required.'),
        body('classId').notEmpty().withMessage('Class id is required.'),
        body('subjectId').notEmpty().withMessage('Subject id is required.'),
        body('lessonSchedules').isArray({ min: 1 }).withMessage('Lesson schedules must be a non-empty array.'),
        body('lessonSchedules.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be an integer between 0 (Sunday) and 6 (Saturday).'),
        body('lessonSchedules.*.startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format.'),
        body('lessonSchedules.*.endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format.'),
        body('lessonSchedules.*.frequency').isInt({ min: 1 }).withMessage('Frequency must be an integer greater than 0.')
    ];
}

export const lessonPatchValidationRule = () => {
    return [
        body('description').notEmpty().withMessage('Description is required.')
    ];
}