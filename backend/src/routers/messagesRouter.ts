import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { UserType } from '../enums/userTypes.js';
import { getMessagesBetweenUsers, getRecentConversations, getUnreadMessages } from '../handlers/messages.js';

const messagesRouter = Router();

messagesRouter.get('/recent',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getRecentConversations
);

messagesRouter.get('/unread',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getUnreadMessages
);

messagesRouter.get('/:interlocutorId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    getMessagesBetweenUsers
);

export default messagesRouter;