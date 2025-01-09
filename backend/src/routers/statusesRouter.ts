import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createStatus, getStatuses, deleteStatus, updateStatus } from '../handlers/statuses.js';
import { validateCreateStatus, validateDeleteStatus } from '../validations/statusesValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const statusesRouter = Router();

statusesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateStatus(),
    handleInputErrors,
    createStatus
)

statusesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getStatuses
)

statusesRouter.patch('/:statusId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    updateStatus
)

statusesRouter.delete('/:statusId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteStatus(),
    handleInputErrors,
    deleteStatus
)

export default statusesRouter;