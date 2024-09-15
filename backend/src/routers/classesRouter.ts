import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateClass, validateAssignStudent, validateClassUpdate, validateClassId } from '../validations/classesValidation.js';
import { getClasses, createClass, assignStudent, updateClass, deleteClass, getStudents } from '../handlers/classes.js';
import { handleInputErrors } from '../modules/middleware.js';

const classesRouter = Router();

classesRouter.post('',
    authenticate,
    authorize(['administrator']),
    validateCreateClass(),
    handleInputErrors,
    createClass
);

classesRouter.get('',
    authenticate,
    authorize(['administrator', 'teacher']),
    getClasses
);

classesRouter.get('/:classId/students',
    authenticate,
    authorize(['administrator', 'teacher', 'parent', 'student']),
    validateClassId(),
    handleInputErrors,
    getStudents
);

classesRouter.patch('/:classId',
    authenticate,
    authorize(['administrator']),
    validateClassUpdate(),
    handleInputErrors,
    updateClass
);

classesRouter.patch('/:classId/assign-student',
    authenticate,
    authorize(['administrator']),
    validateAssignStudent(),
    handleInputErrors,
    assignStudent
);

classesRouter.delete('/:classId',
    authenticate,
    authorize(['administrator']),
    validateClassId(),
    handleInputErrors,
    deleteClass
);

export default classesRouter;