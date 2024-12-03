import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getAvailableParents } from '../handlers/parents.js';


const parentsRouter = Router();

parentsRouter.get('/available-parents',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getAvailableParents
);

export default parentsRouter;