import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getMessagesBetweenUsers, getRecentConversations } from '../handlers/messages.js';

const messagesRouter = Router();

messagesRouter.get('/recent/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    getRecentConversations
);

messagesRouter.get('/:studentId/:otherUserId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    getMessagesBetweenUsers
);

export default messagesRouter;