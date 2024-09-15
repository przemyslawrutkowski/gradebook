import { createIntValidation } from "./validationUtils";

export const validateAssignParentToStudent = () => {
    return [
        createIntValidation('studentId'),
        createIntValidation('parentId')
    ];
}

export const validateUnassignParentFromStudent = () => {
    return [
        createIntValidation('studentId', 'param'),
        createIntValidation('studentId', 'param'),
    ];
}