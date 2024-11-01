import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { signIn, forgotPassword, resetPassword } from '../handlers/users.js';
import { signUpStudent } from '../handlers/students.js';
import { signUpTeacher } from '../handlers/teachers.js';
import { signUpParent } from '../handlers/parents.js';
import { signUpAdministrator } from '../handlers/administrators.js';
import { validateSignIn, validateSignUp, validateForgotPassword, validateResetPassword } from '../validations/authValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const authRouter = Router();

authRouter.post('/signin',
    validateSignIn(),
    handleInputErrors,
    signIn
);

authRouter.post('/signup/student',
    authenticate,
    authorize([UserType.Administrator]),
    validateSignUp(),
    handleInputErrors,
    signUpStudent
);

authRouter.post('/signup/teacher',
    authenticate,
    authorize([UserType.Administrator]),
    validateSignUp(),
    handleInputErrors,
    signUpTeacher
);

authRouter.post('/signup/parent',
    authenticate,
    authorize([UserType.Administrator]),
    validateSignUp(),
    handleInputErrors,
    signUpParent
);

authRouter.post('/signup/administrator',
    //authenticate,
    //authorize([UserType.Administrator]),
    validateSignUp(),
    handleInputErrors,
    signUpAdministrator
);

authRouter.post('/forgot-password',
    validateForgotPassword(),
    handleInputErrors,
    forgotPassword
)

authRouter.post('/reset-password',
    authenticate,
    validateResetPassword(),
    handleInputErrors,
    resetPassword
)

export default authRouter;