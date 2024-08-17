import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { studentAndClassIdsValidationRules } from '../validations/studentsValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { assignClassToStudent } from '../handlers/students.js';

const studentsRouter = Router();

studentsRouter.post('',
    authenticate,
    authorize(['administrator']),
    studentAndClassIdsValidationRules(),
    handleInputErrors,
    assignClassToStudent
);

export default studentsRouter;