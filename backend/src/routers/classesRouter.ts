import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { classCreationValidationRules, classAndStudentIdsValidationRules, classPatchValidationRules } from '../validations/classesValidation.js';
import { createClass, assignStudent, patchClass, deleteClass } from '../handlers/classes.js';
import { handleInputErrors } from '../modules/middleware.js';

const classesRouter = Router();

classesRouter.post('',
    authenticate,
    authorize(['administrator']),
    classCreationValidationRules(),
    handleInputErrors,
    createClass
);

classesRouter.patch('/:id',
    authenticate,
    authorize(['administrator']),
    classPatchValidationRules(),
    handleInputErrors,
    patchClass
);

classesRouter.delete('/:id',
    authenticate,
    authorize(['administrator']),
    deleteClass
);

classesRouter.patch('/:classId/assign-student',
    authenticate,
    authorize(['administrator']),
    classAndStudentIdsValidationRules(),
    handleInputErrors,
    assignStudent
);

classesRouter.get('/:id/students',
    authenticate,
    authorize(['administrator, teacher, parent, student']),

)

export default classesRouter;