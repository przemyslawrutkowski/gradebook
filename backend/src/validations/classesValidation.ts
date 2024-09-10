import { body } from 'express-validator';

// Discuss the validation rules

export const classCreationValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.'),
        body('yearbook').notEmpty().withMessage('Yearbook is required.')
    ];
}

export const studentIdValidationRule = () => {
    return [
        body('studentId').notEmpty().withMessage('Student id is required.')
    ]
}

export const classPatchValidationRules = () => {
    return [
        body('name').if(body('yearbook').isEmpty()).notEmpty().withMessage('Class name is required.'),
        body('yearbook').if(body('name').isEmpty()).notEmpty().withMessage('Yearbook is required.')
    ]
}