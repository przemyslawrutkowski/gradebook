import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { lessonsGenerationValidationRules, lessonPatchValidationRule } from '../validations/lessonsValidation.js';
import { generateLessons, deleteLessonsSeries, patchLesson } from '../handlers/lessons.js';
import { handleInputErrors } from '../modules/middleware.js';

const lessonsRouter = Router();

lessonsRouter.post('',
    authenticate,
    authorize(['administrator']),
    lessonsGenerationValidationRules(),
    handleInputErrors,
    generateLessons
)

/*
The idea: the teacher starts a lesson, in order to finish it he has to enter a description of the lesson.
After confirming the termination operation - in the database the lesson record is updated 
*/

lessonsRouter.patch('/:id',
    authenticate,
    authorize(['administrator', 'teacher']),
    lessonPatchValidationRule(),
    handleInputErrors,
    patchLesson
)

lessonsRouter.delete('/:id',
    authenticate,
    authorize(['administrator']),
    deleteLessonsSeries
)

export default lessonsRouter;