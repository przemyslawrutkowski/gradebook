import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getAllStudents, getStudentById } from '../handlers/students.js';
import { getAllTeachers } from '../handlers/teachers.js';

const teachersRouter = Router();

teachersRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student, UserType.Parent]),
    getAllTeachers
);

// teachersRouter.get('/:studentId',
//     authenticate,
//     authorize([UserType.Administrator, UserType.Teacher]),

// );

export default teachersRouter;