import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateClass, validateAssignStudent, validateUpdateClass, validateClassId } from '../validations/classesValidation.js';
import { getClasses, createClass, assignStudent, updateClass, deleteClass, getStudents, getClassById, removeStudentFromClass } from '../handlers/classes.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const classesRouter = Router();

classesRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateClass(),
    handleInputErrors,
    createClass
);

classesRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getClasses
);

classesRouter.get('/:classId/students',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateClassId(),
    handleInputErrors,
    getStudents
);

classesRouter.get('/:classId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getClassById
);

classesRouter.patch('/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateUpdateClass(),
    handleInputErrors,
    updateClass
);

classesRouter.patch('/:classId/assign-student',
    authenticate,
    authorize([UserType.Administrator]),
    validateAssignStudent(),
    handleInputErrors,
    assignStudent
);

classesRouter.patch('/:classId/remove-student',
    authenticate,
    authorize([UserType.Administrator]),
    validateAssignStudent(),
    handleInputErrors,
    removeStudentFromClass
);

classesRouter.delete('/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateClassId(),
    handleInputErrors,
    deleteClass
);

export default classesRouter;
