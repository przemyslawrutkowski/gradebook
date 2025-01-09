import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { updateQuestion, deleteQuestion } from '../handlers/questions.js';
import { validateUpdateQuestion, validateDeleteQuestion } from '../validations/questionsValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const questionsRouter = Router();

questionsRouter.patch('/:questionId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateQuestion(),
    handleInputErrors,
    updateQuestion
)

questionsRouter.delete('/:questionId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteQuestion(),
    handleInputErrors,
    deleteQuestion
)

export default questionsRouter;