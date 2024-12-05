import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { createUserType, deleteUserType, getUserTypes } from '../handlers/userTypes.js';
import { validateCreateUserType, validateDeleteUserType } from '../validations/userTypesValidation.js';
import { UserType } from '../enums/userTypes.js';

const userTypesRouter = Router();

userTypesRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateUserType(),
    handleInputErrors,
    createUserType
)

userTypesRouter.delete('/:userTypeId',
    authenticate,
    authorize([UserType.Administrator]),
    validateDeleteUserType(),
    handleInputErrors,
    deleteUserType
)
userTypesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student, UserType.Parent]),
    getUserTypes
  );

export default userTypesRouter;