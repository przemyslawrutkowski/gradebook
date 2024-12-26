import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation, createIntValidation, createDateValidation, createTimeValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const name: string | undefined = req.body.name;
        const location: string | undefined = req.body.location;
        const description: string | undefined = req.body.description;
        const date: Date | undefined = req.body.date ? new Date(req.body.date) : undefined;
        const startTime: Date | undefined = req.body.startTime ? new Date(req.body.startTime) : undefined;
        const endTime: Date | undefined = req.body.endTime ? new Date(req.body.endTime) : undefined;
        const eventTypeId: string | undefined = req.body.eventTypeId;

        if (!name && !location && !description && !date && !startTime && !endTime && !eventTypeId)
            throw new Error('At least one field must be provided.')

        if (name) createNotEmptyValidation('name').run(req);
        if (location) createNotEmptyValidation('location').run(req);
        if (description) createNotEmptyValidation('description').run(req);
        if (date) createDateValidation('date').run(req);
        if (startTime) createTimeValidation('startTime').run(req);
        if (endTime) createTimeValidation('endTime').run(req);
        if (eventTypeId) createNotEmptyValidation('eventTypeId').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateSchoolEvents = () => [
    createNotEmptyValidation('name'),
    createNotEmptyValidation('location'),
    createNotEmptyValidation('description'),
    createDateValidation('date'),
    createTimeValidation('startTime'),
    createTimeValidation('endTime'),
    createNotEmptyValidation('eventTypeId'),
];

export const validateSchoolEventId = () => [
    createNotEmptyValidation('schoolEventId', 'param'),
];

export const validateUpdateSchoolEvent = () => [
    createNotEmptyValidation('schoolEventId', 'param'),
    atLeastOneFieldValidation()
];