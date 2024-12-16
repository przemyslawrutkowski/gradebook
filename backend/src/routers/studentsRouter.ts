import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getStudents, getStudentById } from '../handlers/students.js';

const studentsRouter = Router();

studentsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getStudents
);

studentsRouter.get('/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getStudentById
);

export default studentsRouter;