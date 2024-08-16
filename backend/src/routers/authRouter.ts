import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { signIn } from '../handlers/users.js';
import { signUpStudent, signUpTeacher, signUpParent, signUpAdministrator } from '../handlers/administrators.js';
import { signInValidationRules, signUpValidationRules } from '../validations/authValidation.js';
import { handleInputErrors } from '../modules/middleware.js';

const authRouter = Router();

authRouter.post('/signin',
    signInValidationRules(),
    handleInputErrors,
    signIn
);

authRouter.post('/signup/student',
    authenticate,
    authorize(['administrator']),
    signUpValidationRules(),
    handleInputErrors,
    signUpStudent
);

authRouter.post('/signup/teacher',
    authenticate,
    authorize(['administrator']),
    signUpValidationRules(),
    handleInputErrors,
    signUpTeacher
);

authRouter.post('/signup/parent',
    authenticate,
    authorize(['administrator']),
    signUpValidationRules(),
    handleInputErrors,
    signUpParent
);

authRouter.post('/signup/administrator',
    authenticate,
    authorize(['administrator']),
    signUpValidationRules(),
    handleInputErrors,
    signUpAdministrator
);

export default authRouter;