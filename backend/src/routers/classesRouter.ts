import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { classCreationValidationRules, classAndStudentIdsValidationRules, classPatchValidationRules } from '../validations/classesValidation.js';
import { createClass, assignClassToStudent, patchClass } from '../handlers/classes.js';
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
)

classesRouter.post('/assign-class-to-student',
    authenticate,
    authorize(['administrator']),
    classAndStudentIdsValidationRules(),
    handleInputErrors,
    assignClassToStudent
);

export default classesRouter;