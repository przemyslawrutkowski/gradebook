import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { classCreationValidationRules } from '../validations/classesValidation.js';
import { createClass } from '../handlers/classes.js';
import { handleInputErrors } from '../modules/middleware.js';

const classesRouter = Router();

classesRouter.post('',
    authenticate,
    authorize(['administrator']),
    classCreationValidationRules(),
    handleInputErrors,
    createClass
);

export default classesRouter;