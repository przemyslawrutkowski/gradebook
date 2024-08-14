import { Router } from 'express';
import { protect, authorize } from './modules/auth.js';
import { signIn } from './handlers/users.js';
import { signUpStudent, signUpTeacher, signUpParent, signUpAdministrator } from './handlers/administrators.js';
import { signInValidationRules, signUpValidationRules } from './modules/validation.js';
import { handleInputErrors } from './modules/middleware.js';

const router = Router();

router.post('/signin',
    signInValidationRules(),
    handleInputErrors,
    signIn
);

router.post('/signup/student',
    protect,
    authorize(['admin']),
    signUpValidationRules(),
    handleInputErrors,
    signUpStudent
);

router.post('/signup/teacher',
    protect,
    authorize(['admin']),
    signUpValidationRules(),
    handleInputErrors,
    signUpTeacher
);

router.post('/signup/parent',
    protect,
    authorize(['admin']),
    signUpValidationRules(),
    handleInputErrors,
    signUpParent
);

router.post('/signup/administrator',
    //protect,
    //authorize(['admin']),
    signUpValidationRules(),
    handleInputErrors,
    signUpAdministrator
);

export default router;