import { createNotEmptyValidation } from "../utils/validationHelpers";

export const validateCreateStudentParentRelationship = () => {
    return [
        createNotEmptyValidation('studentId'),
        createNotEmptyValidation('parentId')
    ];
}

export const validateDeleteStudentParentRelationship = () => {
    return [
        createNotEmptyValidation('studentId', 'param'),
        createNotEmptyValidation('parentId', 'param'),
    ];
}