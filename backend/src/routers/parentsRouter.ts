import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getParents } from '../handlers/parents.js';


const parentsRouter = Router();

parentsRouter.get('/available-parents',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    getParents
);

export default parentsRouter;