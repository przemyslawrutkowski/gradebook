import { Router } from 'express';
import { protect } from './modules/auth.js';
import { signIn } from './handlers/users.js';
import { signUpStudent } from './handlers/students.js';
import { signUpTeacher } from './handlers/teachers.js';
import { signUpParent } from './handlers/parents.js';
import { body } from 'express-validator'
import { handleInputErrors } from './modules/middleware.js';

const router = Router();

router.post('/signin',
    body('email').isEmail().withMessage('Invalid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be longer than 8 characters.'),
    handleInputErrors,
    signIn
);

const signUpValidationRules = () => {
    return [
        body('pesel').isLength({ min: 11, max: 11 }).withMessage('PESEL must consist of 11 digits.'),
        body('email').isEmail().withMessage('Invalid email address.'),
        body('phoneNumber').isMobilePhone('pl-PL'),
        body('password').isLength({ min: 8 }).withMessage('Password must be longer than 8 characters.'),
        body('passwordConfirm').custom((value, { req }) => {
            return value === req.body.password;
        }).withMessage('Passwords do not match.'),
        body('firstName')
            .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters long.')
            .isAlpha().withMessage('First name must contain only letters')
            .custom(value => {
                if (value.charAt(0) !== value.charAt(0).toUpperCase()) return false;
                return true;
            }).withMessage('First name must start with an uppercase letter.'),
        body('lastName')
            .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters long.')
            .isAlpha().withMessage('Last name must contain only letters')
            .custom(value => {
                if (value.charAt(0) !== value.charAt(0).toUpperCase()) return false;
                return true;
            }).withMessage('Last name must start with an uppercase letter.')]
}

router.post('/signupstudent',
    signUpValidationRules(),
    handleInputErrors,
    signUpStudent);

router.post('/signupteacher',
    signUpValidationRules(),
    handleInputErrors,
    signUpTeacher);

router.post('/signupparent',
    signUpParent,
    signUpValidationRules(),
    handleInputErrors);

export default router;