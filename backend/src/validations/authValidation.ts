import { emailValidation, passwordValidation, peselValidation, phoneNumberValidation, passwordConfirmValidation, nameValidation } from './validationUtils';

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
    ...nameValidation('firstName'),
    ...nameValidation('lastName')
];

export const validateForgotPassword = () => [
    emailValidation
];

export const validateResetPassword = () => [
    passwordValidation
];