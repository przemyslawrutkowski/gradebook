import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateGrade, validateCreateFinalGrade, validateGetGrades, validateStudentId, validateUpdateGrade, validateDeleteGrade, validateUpdateFinalGrade } from '../validations/gradesValidation.js';
import { createGrade, getGrades, getThreeLatestGrades, updateGrade, deleteGrade, getAllGradesForStudent, getAllGrades, createFinalGrade, getFinalGrades, updateFinalGrade, deleteFinalGrade } from '../handlers/grades.js';
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

gradesRouter.post('/final',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateFinalGrade(),
    handleInputErrors,
    createFinalGrade
)

gradesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getAllGrades
)

gradesRouter.get('/latest/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateStudentId(),
    handleInputErrors,
    getThreeLatestGrades
)

gradesRouter.get('/final/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateStudentId(),
    handleInputErrors,
    getFinalGrades
)

gradesRouter.get('/:studentId/:subjectId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetGrades(),
    handleInputErrors,
    getGrades
)

gradesRouter.get('/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getAllGradesForStudent
)

gradesRouter.patch('/final/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateFinalGrade(),
    handleInputErrors,
    updateFinalGrade
)

gradesRouter.patch('/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateGrade(),
    handleInputErrors,
    updateGrade
)

gradesRouter.delete('/final/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteGrade(),
    handleInputErrors,
    deleteFinalGrade
)

gradesRouter.delete('/:gradeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteGrade(),
    handleInputErrors,
    deleteGrade
)

export default gradesRouter;