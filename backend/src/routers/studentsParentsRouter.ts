import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateStudentParentRelationship, validateDeleteStudentParentRelationship } from '../validations/studentsParentsValidation.js';
import { createStudentParentRelationship, deleteStudentParentRelationship, getStudentsForParent } from '../handlers/studentsParents.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const studentsParentsRouter = Router();

studentsParentsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateStudentParentRelationship(),
    handleInputErrors,
    createStudentParentRelationship
);

studentsParentsRouter.delete('/:studentId/:parentId',
    authenticate,
    authorize([UserType.Administrator]),
    validateDeleteStudentParentRelationship(),
    handleInputErrors,
    deleteStudentParentRelationship
);

studentsParentsRouter.get('/:parentId/students',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getStudentsForParent
);

export default studentsParentsRouter;