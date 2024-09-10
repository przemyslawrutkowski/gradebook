import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { lessonsGenerationValidationRules, lessonPatchValidationRule } from '../validations/lessonsValidation.js';
import { generateLessons, patchLesson } from '../handlers/lessons.js';
import { handleInputErrors } from '../modules/middleware.js';

const lessonsRouter = Router();

lessonsRouter.post('/generate',
    authenticate,
    authorize(['administrator']),
    lessonsGenerationValidationRules(),
    handleInputErrors,
    generateLessons
)

lessonsRouter.patch('/:id',
    authenticate,
    authorize(['administrator', 'teacher']),
    lessonPatchValidationRule(),
    handleInputErrors,
    patchLesson
)

export default lessonsRouter;