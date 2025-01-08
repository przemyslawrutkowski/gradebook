import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createProblemType, getProblemTypes, deleteProblemType } from '../handlers/problemTypes.js';
import { validateCreateProblemType, validateDeleteProblemType } from '../validations/problemTypesValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const problemTypesRouter = Router();

problemTypesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateProblemType(),
    handleInputErrors,
    createProblemType
)

problemTypesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getProblemTypes
)

problemTypesRouter.delete('/:problemTypeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteProblemType(),
    handleInputErrors,
    deleteProblemType
)

export default problemTypesRouter;