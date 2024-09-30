import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { validateSubjectName, validateSubjectId, validateSubjectUpdate } from '../validations/subjectsValidation.js';
import { createSubject, getSubjects, updateSubject, deleteSubject } from '../handlers/subjects.js';

const subjectsRouter = Router();

subjectsRouter.post('',
    authenticate,
    authorize(['administrator']),
    validateSubjectName(),
    handleInputErrors,
    createSubject
)

subjectsRouter.get('',
    authenticate,
    authorize(['administrator', 'teacher', 'parent', 'student']),
    getSubjects
)

subjectsRouter.patch('/:subjectId',
    authenticate,
    authorize(['administrator']),
    validateSubjectUpdate(),
    handleInputErrors,
    updateSubject
)

subjectsRouter.delete('/:subjectId',
    authenticate,
    authorize(['administrator']),
    validateSubjectId(),
    handleInputErrors,
    deleteSubject
)

export default subjectsRouter;