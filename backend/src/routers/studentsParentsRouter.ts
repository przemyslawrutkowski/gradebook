import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateStudentParentRelationship, validateDeleteStudentParentRelationship } from '../validations/studentsParentsValidation.js';
import { createStudentParentRelationship, deleteStudentParentRelationship } from '../handlers/studentsParents.js';
import { handleInputErrors } from '../modules/middleware.js';

const studentsParentsRouter = Router();

studentsParentsRouter.post('/student-parent-relationship',
    authenticate,
    authorize(['administrator']),
    validateCreateStudentParentRelationship(),
    handleInputErrors,
    createStudentParentRelationship
);

studentsParentsRouter.delete('/student-parent-relationship/:studentId/:parentId',
    authenticate,
    authorize(['administrator']),
    validateDeleteStudentParentRelationship(),
    handleInputErrors,
    deleteStudentParentRelationship
);

export default studentsParentsRouter;