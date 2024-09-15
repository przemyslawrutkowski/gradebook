import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateGenerateLessons, validateUpdateLesson } from '../validations/lessonsValidation.js';
import { generateLessons, deleteLessons, updateLesson } from '../handlers/lessons.js';
import { handleInputErrors } from '../modules/middleware.js';

const lessonsRouter = Router();

lessonsRouter.post('',
    authenticate,
    authorize(['administrator']),
    validateGenerateLessons(),
    handleInputErrors,
    generateLessons
)

lessonsRouter.get('/:classId/:subjectId',
    authenticate,
    authorize(['administrator', 'teacher', 'parent', 'student']),
    validateUpdateLesson(),
    handleInputErrors,
    updateLesson
)

lessonsRouter.patch('/:lessonId',
    authenticate,
    authorize(['administrator', 'teacher']),
    validateUpdateLesson(),
    handleInputErrors,
    updateLesson
)

lessonsRouter.delete('/:classId/:subjectId',
    authenticate,
    authorize(['administrator']),
    deleteLessons
)

export default lessonsRouter;