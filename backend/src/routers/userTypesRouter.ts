import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { createUserType, deleteUserType } from '../handlers/userTypes.js';
import { validateUserTypeName, validateUserTypeId } from '../validations/userTypesValidation.js';

const userTypesRouter = Router();

userTypesRouter.post('',
    authenticate,
    authorize(['administrator']),
    validateUserTypeName(),
    handleInputErrors,
    createUserType
)

userTypesRouter.delete('/:userTypeId',
    authenticate,
    authorize(['administrator']),
    validateUserTypeId(),
    handleInputErrors,
    deleteUserType
)

export default userTypesRouter;