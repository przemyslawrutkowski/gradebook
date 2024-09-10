import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { subjectNameValidationRule } from '../validations/subjectsValidation.js';
import { createSubject, getSubjects, patchSubject, deleteSubject } from '../handlers/subjects.js';

const subjectsRouter = Router();

//create, read, update, delete

subjectsRouter.post('',
    authenticate,
    authorize(['administrator']),
    subjectNameValidationRule(),
    handleInputErrors,
    createSubject
)

subjectsRouter.get('',
    authenticate,
    authorize(['administrator', 'teacher', 'parent', 'student']),
    getSubjects
)

subjectsRouter.patch('/:id',
    authenticate,
    authorize(['administrator']),
    subjectNameValidationRule(),
    handleInputErrors,
    patchSubject
)

subjectsRouter.delete('/:id',
    authenticate,
    authorize(['administrator']),
    deleteSubject
)



export default subjectsRouter;