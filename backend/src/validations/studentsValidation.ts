import { body } from "express-validator";

export const studentAndClassIdsValidationRules = () => {
    return [
        body('studentId').notEmpty().withMessage('Student id is required.'),
        body('classId').notEmpty().withMessage('Class id is required.')
    ]
}