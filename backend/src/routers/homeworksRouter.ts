import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';
import { createHomework, getHomework, getLatestHomework, updateHomework, deleteHomework } from '../handlers/homeworks.js';
import { validateCreateHomework, validateGetHomework, validateGetLatestHomework, validateUpdateHomework, validateDeleteHomework } from '../validations/homeworksValidation.js';

const homeworksRouter = Router();

homeworksRouter.post('/',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateHomework(),
    handleInputErrors,
    createHomework
);

homeworksRouter.get('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    validateGetHomework(),
    handleInputErrors,
    getHomework,
);

homeworksRouter.get('/latest/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    validateGetLatestHomework(),
    handleInputErrors,
    getLatestHomework
);

homeworksRouter.patch('/:homeworkId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateHomework(),
    handleInputErrors,
    updateHomework
);

homeworksRouter.delete('/:homeworkId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteHomework(),
    handleInputErrors,
    deleteHomework
);

export default homeworksRouter;
