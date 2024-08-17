import { body } from 'express-validator';

export const classCreationValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.'),
        body('name').notEmpty().withMessage('Yearbook is required.')
    ];
}