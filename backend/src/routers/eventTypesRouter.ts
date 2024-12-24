import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';
import { validateEventTypeId, validateEventTypeName, validateEventTypeUpdate } from '../validations/eventTypesValidation.js';
import { createEventType, deleteEventType, getEventType, getEventTypes, updateEventType } from '../handlers/eventTypes.js';

const eventTypesRouter = Router();

eventTypesRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateEventTypeName(),
    handleInputErrors,
    createEventType
)

eventTypesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    handleInputErrors,
    getEventTypes
)

eventTypesRouter.get('/:eventTypeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateEventTypeId(),
    handleInputErrors,
    getEventType,
)

eventTypesRouter.patch('/:eventTypeId',
    authenticate,
    authorize([UserType.Administrator]),
    validateEventTypeUpdate(),
    handleInputErrors,
    updateEventType
)

eventTypesRouter.delete('/:eventTypeId',
    authenticate,
    authorize([UserType.Administrator]),
    validateEventTypeId(),
    handleInputErrors,
    deleteEventType
)

export default eventTypesRouter;