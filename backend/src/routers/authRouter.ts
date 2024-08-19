import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { signIn, forgotPassword, resetPassword } from '../handlers/users.js';
import { signUpStudent } from '../handlers/students.js';
import { signUpTeacher } from '../handlers/teachers.js';
import { signUpParent } from '../handlers/parents.js';
import { signUpAdministrator } from '../handlers/administrators.js';
import { signInValidationRules, signUpValidationRules, forgotPasswordValidationRules, resetPasswordValidationRules } from '../validations/authValidation.js';
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
    //authenticate,
    //authorize(['administrator']),
    signUpValidationRules(),
    handleInputErrors,
    signUpAdministrator
);

authRouter.post('/forgot-password',
    forgotPasswordValidationRules(),
    handleInputErrors,
    forgotPassword
)

authRouter.post('/reset-password',
    authenticate,
    resetPasswordValidationRules(),
    handleInputErrors,
    resetPassword
)


export default authRouter;