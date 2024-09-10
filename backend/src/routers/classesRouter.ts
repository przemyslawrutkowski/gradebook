import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { classCreationValidationRules, studentIdValidationRule, classPatchValidationRules } from '../validations/classesValidation.js';
import { getClasses, createClass, assignStudent, patchClass, deleteClass, getStudents } from '../handlers/classes.js';
import { handleInputErrors } from '../modules/middleware.js';

const classesRouter = Router();

classesRouter.post('',
    authenticate,
    authorize(['administrator']),
    classCreationValidationRules(),
    handleInputErrors,
    createClass
);

classesRouter.get('',
    authenticate,
    authorize(['administrator', 'teacher']),
    getClasses
);

//POST because we have to pass our role in request body
classesRouter.post('/:id/students',
    authenticate,
    authorize(['administrator', 'teacher', 'parent', 'student']),
    getStudents
);

classesRouter.patch('/:id',
    authenticate,
    authorize(['administrator']),
    classPatchValidationRules(),
    handleInputErrors,
    patchClass
);

classesRouter.patch('/:classId/assign-student',
    authenticate,
    authorize(['administrator']),
    studentIdValidationRule(),
    handleInputErrors,
    assignStudent
);

classesRouter.delete('/:id',
    authenticate,
    authorize(['administrator']),
    deleteClass
);

export default classesRouter;