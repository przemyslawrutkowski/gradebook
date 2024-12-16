import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getAdministrators } from '../handlers/administrators.js';

const administratorsRouter = Router();

administratorsRouter.get('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getAdministrators
);

export default administratorsRouter;