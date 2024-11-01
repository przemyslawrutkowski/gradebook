import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { validateSubjectName, validateSubjectId, validateSubjectUpdate } from '../validations/subjectsValidation.js';
import { createSubject, getSubjects, updateSubject, deleteSubject } from '../handlers/subjects.js';
import { UserType } from '../enums/userTypes.js';

const subjectsRouter = Router();

subjectsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateSubjectName(),
    handleInputErrors,
    createSubject
)

subjectsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getSubjects
)

subjectsRouter.patch('/:subjectId',
    authenticate,
    authorize([UserType.Administrator]),
    validateSubjectUpdate(),
    handleInputErrors,
    updateSubject
)

subjectsRouter.delete('/:subjectId',
    authenticate,
    authorize([UserType.Administrator]),
    validateSubjectId(),
    handleInputErrors,
    deleteSubject
)

export default subjectsRouter;