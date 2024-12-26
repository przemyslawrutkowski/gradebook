import { Router } from 'express';
import { handleInputErrors } from '../modules/middleware.js';
import { createAttendances, getAttendances, getAttendancesInformations, getStudentAttendances, updateAttendance } from '../handlers/attendances.js';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateAttendances, validateGetAttendances, validateGetAttendancesInformations, validateUpdateAttendance } from '../validations/attendancesValidation.js';
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

attendancesRouter.get('/informations/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateGetAttendancesInformations(),
    handleInputErrors,
    getAttendancesInformations
);

attendancesRouter.patch('/:attendanceId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateAttendance(),
    handleInputErrors,
    updateAttendance
);

attendancesRouter.get('/student/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    getStudentAttendances
);

export default attendancesRouter;