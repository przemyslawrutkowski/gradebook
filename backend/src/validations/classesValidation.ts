import { body } from 'express-validator';

export const classCreationValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.'),
        body('yearbook').notEmpty().withMessage('Yearbook is required.')
    ];
}

export const classAndStudentIdsValidationRules = () => {
    return [
        body('classId').notEmpty().withMessage('Class id is required.'),
        body('studentId').notEmpty().withMessage('Student id is required.')
    ]
}

export const classPatchValidationRules = () => {
    return [
        body('name').if(body('yearbook').isEmpty()).notEmpty().withMessage('Class name is required.'),
        body('yearbook').if(body('name').isEmpty()).notEmpty().withMessage('Yearbook is required.')
    ]
}


