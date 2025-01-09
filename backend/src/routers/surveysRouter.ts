import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createSurvey, sendSurvey, getSurvey, getSurveys, updateSurvey, deleteSurvey } from '../handlers/surveys.js';
import { validateCreateSurvey, validateGetSurvey, validateUpdateSurvey, validateDeleteSurvey } from '../validations/surveysValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const surveysRouter = Router();

surveysRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateSurvey(),
    handleInputErrors,
    createSurvey
)

surveysRouter.post('/submit',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateSurvey(),
    handleInputErrors,
    sendSurvey
)

surveysRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getSurveys
)

surveysRouter.get('/:surveyId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetSurvey(),
    handleInputErrors,
    getSurvey
)

surveysRouter.patch('/:surveyId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateSurvey(),
    handleInputErrors,
    updateSurvey
)

surveysRouter.delete('/:surveyId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteSurvey(),
    handleInputErrors,
    deleteSurvey
)

export default surveysRouter;