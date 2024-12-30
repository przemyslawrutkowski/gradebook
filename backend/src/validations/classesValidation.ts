import { body, validationResult } from 'express-validator';
import { createNotEmptyValidation } from '../utils/validationHelpers';

const atLeastOneFieldValidation = () => {
    return body().custom((value, { req }) => {
        const classNameId: string = req.body.classNameId;
        const schoolYearId: string = req.body.schoolYearId;
        const teacherId: string = req.body.teacherId;

        if (!classNameId && !schoolYearId && !teacherId)
            throw new Error('At least one field must be provided.')

        if (classNameId) createNotEmptyValidation('classNameId').run(req);
        if (schoolYearId) createNotEmptyValidation('schoolYearId').run(req);
        if (teacherId) createNotEmptyValidation('teacherId').run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) return false;
        return true;
    });
};

export const validateCreateClass = () => [
    createNotEmptyValidation('classNameId'),
    createNotEmptyValidation('schoolYearId')
];

export const validateAssignUnassignStudent = () => [
    createNotEmptyValidation('classId', 'param'),
    createNotEmptyValidation('studentId')
];

export const validateUpdateClass = () => [
    createNotEmptyValidation('classId', 'param'),
    atLeastOneFieldValidation(),
];

export const validateClassId = () => [
    createNotEmptyValidation('classId', 'param')
];

export const validateStudentId = () => [
    createNotEmptyValidation('studentId', 'param')
];