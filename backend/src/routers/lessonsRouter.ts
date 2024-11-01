import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateGenerateLessons, validateUpdateLesson, validateGetAndDeleteLessons } from '../validations/lessonsValidation.js';
import { generateLessons, getLessons, updateLesson, deleteLessons } from '../handlers/lessons.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const lessonsRouter = Router();

lessonsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateGenerateLessons(),
    handleInputErrors,
    generateLessons
)

lessonsRouter.get('/:classId/:subjectId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetAndDeleteLessons(),
    handleInputErrors,
    getLessons
)

lessonsRouter.patch('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateLesson(),
    handleInputErrors,
    updateLesson
)

lessonsRouter.delete('/:classId/:subjectId',
    authenticate,
    authorize([UserType.Administrator]),
    validateGetAndDeleteLessons(),
    handleInputErrors,
    deleteLessons
)

export default lessonsRouter;