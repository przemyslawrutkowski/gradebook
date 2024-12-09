import express from 'express';
import { 
    createHomework, 
    getHomeworks, 
    getHomeworkById, 
    updateHomework, 
    deleteHomework 
} from '../handlers/homework';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';

const homeworksRouter = express.Router();

homeworksRouter.post('/', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    createHomework
);

homeworksRouter.get('/', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getHomeworks
);

homeworksRouter.get('/:homeworkId', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getHomeworkById
);

homeworksRouter.post('/:homeworkId', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    updateHomework
);

homeworksRouter.post('/:homeworkId', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    deleteHomework
);

export default homeworksRouter;
