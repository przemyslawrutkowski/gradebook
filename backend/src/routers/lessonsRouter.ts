import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateLessons, validateUpdateLesson, validateClassAndSubjectIds, validateDeleteLesson, validateUserId, validateClassId, validateDeleteLessonsByClassIdAndDate } from '../validations/lessonsValidation.js';
import { createLessons, getLessons, updateLesson, deleteLessonsByClassAndSubjectIds, getAllLessons, getLessonsByClassId, deleteLesson, getLessonsThreeDaysBack, getLessonsThreeDaysAhead, getLessonsToday, getLessonsForUser, deleteLessonsByClassIdAndDate } from '../handlers/lessons.js';
import { handleInputErrors } from '../modules/middleware.js';
import { UserType } from '../enums/userTypes.js';

const lessonsRouter = Router();

lessonsRouter.post('',
    authenticate,
    authorize([UserType.Administrator]),
    validateCreateLessons(),
    handleInputErrors,
    createLessons
)

lessonsRouter.get('',
    authenticate,
    authorize([UserType.Administrator]),
    getAllLessons
)

lessonsRouter.get('/back/:userId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateUserId(),
    handleInputErrors,
    getLessonsThreeDaysBack
)

lessonsRouter.get('/ahead/:userId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateUserId(),
    handleInputErrors,
    getLessonsThreeDaysAhead
)

lessonsRouter.get('/today/:userId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateUserId(),
    handleInputErrors,
    getLessonsToday
)

lessonsRouter.get('/class/:classId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateClassId(),
    handleInputErrors,
    getLessonsByClassId
)

lessonsRouter.get('/user/:userId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateUserId(),
    handleInputErrors,
    getLessonsForUser
)

lessonsRouter.get('/:classId/:subjectId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateClassAndSubjectIds(),
    handleInputErrors,
    getLessons
)

lessonsRouter.patch('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateLesson(),
    handleInputErrors,
    updateLesson
)

lessonsRouter.delete('/class/:classId/subject/:subjectId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateClassAndSubjectIds(),
    handleInputErrors,
    deleteLessonsByClassAndSubjectIds
)

lessonsRouter.delete('/class/:classId/date/:date',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteLessonsByClassIdAndDate(),
    handleInputErrors,
    deleteLessonsByClassIdAndDate
)

lessonsRouter.delete('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteLesson(),
    handleInputErrors,
    deleteLesson
)

export default lessonsRouter;