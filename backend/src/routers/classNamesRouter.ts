import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { validateCreateClassName, validateDeleteClassName, validateUpdateClassName } from '../validations/classNamesValidation.js';
import { createClassName, getClassNames, updateClassName, deleteClassName } from '../handlers/classNames.js';
import { UserType } from '../enums/userTypes.js';

const classNamesRouter = Router();

classNamesRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateClassName(),
    handleInputErrors,
    createClassName
)

classNamesRouter.get('',
    authenticate,
    authorize([UserType.Administrator]),
    getClassNames
)

classNamesRouter.patch('/:classNameId',
    authenticate,
    authorize([UserType.Administrator]),
    validateUpdateClassName(),
    handleInputErrors,
    updateClassName
)

classNamesRouter.delete('/:classNameId',
    authenticate,
    authorize([UserType.Administrator]),
    validateDeleteClassName(),
    handleInputErrors,
    deleteClassName
)

export default classNamesRouter;