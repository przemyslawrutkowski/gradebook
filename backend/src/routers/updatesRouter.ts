import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createUpdate, getUpdates, updateUpdate, deleteUpdate } from '../handlers/updates.js';
import { validateCreateUpdate, validateUpdateUpdate, validateDeleteUpdate } from '../validations/updatesValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const updatesRouter = Router();

updatesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateUpdate(),
    handleInputErrors,
    createUpdate
)

updatesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getUpdates
)

updatesRouter.patch('/:updateId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateUpdate(),
    handleInputErrors,
    updateUpdate
)

updatesRouter.delete('/:updateId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteUpdate(),
    handleInputErrors,
    deleteUpdate
)

export default updatesRouter;