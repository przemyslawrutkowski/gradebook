import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateGrade, validateGetGrades, validateUpdateGrade, validateDeleteGrade } from '../validations/gradesValidation.js';
import { createGrade, getGrades, updateGrade, deleteGrade } from '../handlers/grades.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const gradesRouter = Router();

gradesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateGrade(),
    handleInputErrors,
    createGrade
)

gradesRouter.get('/:studentId/:subjectId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetGrades(),
    handleInputErrors,
    getGrades
)

gradesRouter.patch('/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateGrade(),
    handleInputErrors,
    updateGrade
)

gradesRouter.delete('/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteGrade(),
    handleInputErrors,
    deleteGrade
)

export default gradesRouter;