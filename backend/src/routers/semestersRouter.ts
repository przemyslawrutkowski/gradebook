import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { 
  createSemester, 
  getSemesters, 
  updateSemester, 
  deleteSemester, 
  getSemestersBySchoolYearName 
} from '../handlers/semesters.js';
import { 
  validateCreateSemester, 
  validateDeleteSemester, 
  validateGetSemesters, 
  validateUpdateSemester 
} from '../validations/semestersValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const semestersRouter = Router();

semestersRouter.get('/by-school-year',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getSemestersBySchoolYearName
);

semestersRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateSemester(),
    handleInputErrors,
    createSemester
);

semestersRouter.get('/:schoolYearId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetSemesters(),
    handleInputErrors,
    getSemesters
);

semestersRouter.patch('/:semesterId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateSemester(),
    handleInputErrors,
    updateSemester
);

semestersRouter.delete('/:semesterId',
    authenticate,
    authorize([UserType.Administrator]),
    validateDeleteSemester(),
    handleInputErrors,
    deleteSemester
);

export default semestersRouter;
