import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateGenerateLessons, validateUpdateLesson, validateGetAndDeleteLessons } from '../validations/lessonsValidation.js';
import { generateLessons, getLessons, updateLesson, deleteLessons } from '../handlers/lessons.js';
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
    validateGetAndDeleteLessons(),
    handleInputErrors,
    getLessons
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
    validateGetAndDeleteLessons(),
    handleInputErrors,
    deleteLessons
)

export default lessonsRouter;