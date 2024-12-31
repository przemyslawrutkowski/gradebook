import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateClass, validateAssignUnassignStudent, validateUpdateClass, validateClassId, validateStudentId } from '../validations/classesValidation.js';
import { getClasses, createClass, assignStudent, updateClass, deleteClass, getStudents, getClassById, unassignStudent, getStudentClassId } from '../handlers/classes.js';
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

classesRouter.get('/:classId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateClassId(),
    handleInputErrors,
    getClassById
);

classesRouter.get('/students/:classId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateClassId(),
    handleInputErrors,
    getStudents
);

classesRouter.get('/student/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateStudentId(),
    handleInputErrors,
    getStudentClassId
);

classesRouter.patch('/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateUpdateClass(),
    handleInputErrors,
    updateClass
);

classesRouter.patch('/assign-student/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateAssignUnassignStudent(),
    handleInputErrors,
    assignStudent
);

classesRouter.patch('/unassign-student/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateAssignUnassignStudent(),
    handleInputErrors,
    unassignStudent
);

classesRouter.delete('/:classId',
    authenticate,
    authorize([UserType.Administrator]),
    validateClassId(),
    handleInputErrors,
    deleteClass
);

export default classesRouter;
