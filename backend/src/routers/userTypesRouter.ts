import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { createUserType, deleteUserType } from '../handlers/userTypes.js';
import { validateUserTypeName, validateUserTypeId } from '../validations/userTypesValidation.js';
import { UserType } from '../enums/userTypes.js';

const userTypesRouter = Router();

userTypesRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateUserTypeName(),
    handleInputErrors,
    createUserType
)

userTypesRouter.delete('/:userTypeId',
    authenticate,
    authorize([UserType.Administrator]),
    validateUserTypeId(),
    handleInputErrors,
    deleteUserType
)

export default userTypesRouter;