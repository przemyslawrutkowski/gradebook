import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getTeachers } from '../handlers/teachers.js';

const teachersRouter = Router();

teachersRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getTeachers
);

export default teachersRouter;