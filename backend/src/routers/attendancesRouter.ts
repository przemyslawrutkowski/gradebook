import { Router } from 'express';
import { handleInputErrors } from '../modules/middleware.js';
import { createAttendances, getAttendances, updateAttendance } from '../handlers/attendances.js';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateAttendances, validateGetAttendances, validateUpdateAttendance } from '../validations/attendancesValidation.js';

const attendancesRouter = Router();

attendancesRouter.post('',
    authenticate,
    authorize(['administrator', 'teacher']),
    validateCreateAttendances(),
    handleInputErrors,
    createAttendances
);

attendancesRouter.get('/:lessonId',
    authenticate,
    authorize(['administrator', 'teacher']),
    validateGetAttendances(),
    handleInputErrors,
    getAttendances
);

attendancesRouter.patch('/:lessonId/:studentId',
    authenticate,
    authorize(['administrator', 'teacher']),
    validateUpdateAttendance(),
    handleInputErrors,
    updateAttendance
)

export default attendancesRouter;