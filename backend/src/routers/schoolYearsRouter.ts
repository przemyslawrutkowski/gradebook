import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { createSchoolYear, getSchoolYears, updateSchoolYear, deleteSchoolYear, getSchoolYearById } from '../handlers/schoolYears.js';
import { validateCreateSchoolYear, validateUpdateSchoolYear, validateDeleteSchoolYear } from '../validations/schoolYearsValidation.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const schoolYearsRouter = Router();

schoolYearsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateSchoolYear(),
    handleInputErrors,
    createSchoolYear
)

schoolYearsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    handleInputErrors,
    getSchoolYears
)

schoolYearsRouter.get('/:schoolYearId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    handleInputErrors,
    getSchoolYearById
)

schoolYearsRouter.patch('/:schoolYearId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateSchoolYear(),
    handleInputErrors,
    updateSchoolYear
)

schoolYearsRouter.delete('/:schoolYearId',
    authenticate,
    authorize([UserType.Administrator]),
    validateDeleteSchoolYear(),
    handleInputErrors,
    deleteSchoolYear
)

export default schoolYearsRouter;