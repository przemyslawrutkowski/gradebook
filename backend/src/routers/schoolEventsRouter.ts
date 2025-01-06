import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateGrade, validateGetGrades, validateStudentId, validateUpdateGrade, validateDeleteGrade } from '../validations/gradesValidation.js';
import { createGrade, getGrades, getThreeLatestGrades, updateGrade, deleteGrade } from '../handlers/grades.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';
import { validateCreateSchoolEvents, validateSchoolEventId, validateUpdateSchoolEvent } from '../validations/schoolEventsValidation.js';
import { createSchoolEvent, deleteSchoolEvent, getSchoolEvent, getSchoolEvents, updateSchoolEvent } from '../handlers/schoolEvents.js';

const schoolEventsRouter = Router();

schoolEventsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateSchoolEvents(),
    handleInputErrors,
    createSchoolEvent
)

schoolEventsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    handleInputErrors,
    getSchoolEvents
)

schoolEventsRouter.get('/:schoolEventId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateSchoolEventId(),
    handleInputErrors,
    getSchoolEvent
)

schoolEventsRouter.patch('/:schoolEventId',
    authenticate,
    authorize([UserType.Administrator]),
    validateUpdateSchoolEvent(),
    handleInputErrors,
    updateSchoolEvent
)

schoolEventsRouter.delete('/:schoolEventId',
    authenticate,
    authorize([UserType.Administrator]),
    validateSchoolEventId(),
    handleInputErrors,
    deleteSchoolEvent
)

export default schoolEventsRouter;