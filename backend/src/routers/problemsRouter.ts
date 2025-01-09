import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createProblem, getProblems, getProblemsByType, updateProblem, deleteProblem } from '../handlers/problems.js';
import { validateCreateProblem, validateGetProblemsByType, validateUpdateProblem, validateDeleteProblem } from '../validations/problemsValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const problemsRouter = Router();

problemsRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateCreateProblem(),
    handleInputErrors,
    createProblem
)

problemsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getProblems
)

problemsRouter.get('/:problemTypeId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetProblemsByType(),
    handleInputErrors,
    getProblemsByType
)

problemsRouter.patch('/:problemId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateProblem(),
    handleInputErrors,
    updateProblem
)

problemsRouter.delete('/:problemId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteProblem(),
    handleInputErrors,
    deleteProblem
)

export default problemsRouter;