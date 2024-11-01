import { Router } from 'express';
import { handleInputErrors } from '../modules/middleware.js';
import { createAttendances, getAttendances, updateAttendance } from '../handlers/attendances.js';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateAttendances, validateGetAttendances, validateUpdateAttendance } from '../validations/attendancesValidation.js';
import { UserType } from '../enums/userTypes.js';

const attendancesRouter = Router();

attendancesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateAttendances(),
    handleInputErrors,
    createAttendances
);

attendancesRouter.get('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateGetAttendances(),
    handleInputErrors,
    getAttendances
);

attendancesRouter.patch('/:lessonId/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateAttendance(),
    handleInputErrors,
    updateAttendance
);

export default attendancesRouter;