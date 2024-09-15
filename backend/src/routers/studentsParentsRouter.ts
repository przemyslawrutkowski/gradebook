import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateAssignParentToStudent, validateUnassignParentFromStudent } from '../validations/studentsParentsValidation.js';
import { assignParentToStudent, unassignParentFromStudent } from '../handlers/studentsParents.js';
import { handleInputErrors } from '../modules/middleware.js';

const studentsParentsRouter = Router();

studentsParentsRouter.post('/assign-parent',
    authenticate,
    authorize(['administrator']),
    validateAssignParentToStudent(),
    handleInputErrors,
    assignParentToStudent
);

studentsParentsRouter.delete('/unassign-parent/:studentId/:parentId',
    authenticate,
    authorize(['administrator']),
    validateUnassignParentFromStudent(),
    handleInputErrors,
    unassignParentFromStudent
);

export default studentsParentsRouter;