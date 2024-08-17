import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { studentAndParentIdsValidationRules } from '../validations/studentsParentsValidation.js';
import { assignParentToStudent, unassignParentFromStudent } from '../handlers/studentsParents.js';
import { handleInputErrors } from '../modules/middleware.js';

const studentsParentsRouter = Router();

studentsParentsRouter.post('/assign-parent',
    authenticate,
    authorize(['administrator']),
    studentAndParentIdsValidationRules(),
    handleInputErrors,
    assignParentToStudent
);

studentsParentsRouter.delete('/unassign-parent',
    authenticate,
    authorize(['administrator']),
    studentAndParentIdsValidationRules(),
    handleInputErrors,
    unassignParentFromStudent
);

export default studentsParentsRouter;