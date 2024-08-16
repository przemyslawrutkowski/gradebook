import { body } from "express-validator";

export const studentAndParentIdsValidationRules = () => {
    return [
        body('studentId').notEmpty().withMessage('Student id is required.'),
        body('parentId').notEmpty().withMessage('Parent id is required.')
    ];
}