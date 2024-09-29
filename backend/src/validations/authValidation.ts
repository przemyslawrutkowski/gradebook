import { emailValidation, passwordValidation, peselValidation, phoneNumberValidation, passwordConfirmValidation, createNameValidation } from '../utils/validationHelpers';

export const validateSignIn = () => [
    emailValidation,
    passwordValidation
];

export const validateSignUp = () => [
    peselValidation,
    emailValidation,
    phoneNumberValidation,
    passwordValidation,
    passwordConfirmValidation,
    ...createNameValidation('firstName'),
    ...createNameValidation('lastName')
];

export const validateForgotPassword = () => [
    emailValidation
];

export const validateResetPassword = () => [
    passwordValidation
];