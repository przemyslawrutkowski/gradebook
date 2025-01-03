import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createExam, updateExam, deleteExam } from '../handlers/exams.js';
import { validateCreateExam, validateUpdateExam, validateDeleteExam } from '../validations/examsValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const examsRouter = Router();

examsRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateExam(),
    handleInputErrors,
    createExam
)

examsRouter.patch('/:examId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateExam(),
    handleInputErrors,
    updateExam
)

examsRouter.delete('/:examId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteExam(),
    handleInputErrors,
    deleteExam
)

export default examsRouter;