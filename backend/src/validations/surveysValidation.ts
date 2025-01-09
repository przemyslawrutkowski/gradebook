import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createTimeValidation, createArrayValidation, createDateValidation } from '../utils/validationHelpers';
import Question from '../interfaces/question';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const name: string = req.body.name;
        const description: string = req.body.description;
        const startDate: string = req.body.startDate;
        const endDate: string = req.body.endDate;
        const startTime: string = req.body.startTime;
        const endTime: string = req.body.endTime;
        const questionsToAdd: Question[] = req.body.questionsToAdd;
        const questionsIdsToRemove: string[] = req.body.questionsIdsToRemove;

        if (!name && !description && !startDate && !endDate && !startTime && !endTime && !questionsToAdd && !questionsIdsToRemove)
            throw new Error('At least one field must be provided.')

        if (startDate || endDate || startTime || endTime)
            if (!startDate || !endDate || !startTime || !endTime)
                throw new Error('If any of these fields: startDate, endDate, startTime, endTime is provided then all of them must be.')

        if (name) createNotEmptyValidation('name').run(req);
        if (description) createNotEmptyValidation('description').run(req);
        if (startDate) createDateValidation('startDate').run(req);
        if (endDate) createDateValidation('endDate').run(req);
        if (startTime) createTimeValidation('startTime').run(req);
        if (endTime) createTimeValidation('endTime').run(req);
        if (questionsToAdd) {
            createArrayValidation('questionsToAdd').run(req);
            createNotEmptyValidation('questionsToAdd.*.content').run(req);
            createNotEmptyValidation('questionsToAdd.*.questionTypeId').run(req);

            body('questionsToAdd.*.responses')
                .optional()
                .isArray({ min: 1 })
                .withMessage('responses must be a non-empty array.')
                .run(req);

            body('questionsToAdd.*.responses.*.content')
                .notEmpty()
                .withMessage('content field is required.')
                .run(req);
        }
        if (questionsIdsToRemove) {
            body('questionsIdsToRemove')
                .optional()
                .isArray({ min: 1 })
                .withMessage('responses must be a non-empty array.')
                .run(req);

            body('questionsIdsToRemove.*')
                .notEmpty()
                .withMessage('question to remove ID is required.')
                .run(req);
        }

        return true;
    });
};

const questionsValidation = () => {
    return body().custom((value, { req }) => {
        createArrayValidation('questions').run(req);
        createNotEmptyValidation('questions.*.content').run(req);
        createNotEmptyValidation('questions.*.questionTypeId').run(req);

        body('questions.*.responses')
            .optional()
            .isArray({ min: 1 })
            .withMessage('responses must be a non-empty array.')
            .run(req);

        body('questions.*.responses.*.content')
            .notEmpty()
            .withMessage('content field is required.')
            .run(req);

        return true;
    });
};

export const validateCreateSurvey = () => [
    createNotEmptyValidation('name'),
    createNotEmptyValidation('description'),
    createDateValidation('startDate'),
    createDateValidation('endDate'),
    createTimeValidation('startTime'),
    createTimeValidation('endTime'),
    questionsValidation()

];

export const validateSendSurvey = () => [
    createNotEmptyValidation('studentId'),
    createNotEmptyValidation('surveyId'),
    createArrayValidation('responses'),
    createNotEmptyValidation('questions.*.content'),
    createNotEmptyValidation('questions.*.questionId')
];

export const validateGetSurvey = () => [
    createNotEmptyValidation('surveyId', 'param')
];

export const validateUpdateSurvey = () => [
    createNotEmptyValidation('surveyId', 'param'),
    atLeastOneFieldValidation()
];

export const validateDeleteSurvey = () => [
    createNotEmptyValidation('surveyId', 'param')
];