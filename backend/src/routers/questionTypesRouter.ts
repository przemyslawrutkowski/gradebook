import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createQuestionType, getQuestionTypes, deleteQuestionType } from '../handlers/questionTypes.js';
import { validateCreateQuestionType, validateDeleteQuestionType } from '../validations/questionTypesValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const questionTypesRouter = Router();

questionTypesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateQuestionType(),
    handleInputErrors,
    createQuestionType
)

questionTypesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getQuestionTypes
)

questionTypesRouter.delete('/:questionTypeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteQuestionType(),
    handleInputErrors,
    deleteQuestionType
)

export default questionTypesRouter;