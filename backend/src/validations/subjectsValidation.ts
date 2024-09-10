import { body } from "express-validator";

export const subjectNameValidationRule = () => {
    return [
        body('name').notEmpty().withMessage('Name is required.')
    ];
}