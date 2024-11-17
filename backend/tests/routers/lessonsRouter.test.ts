import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { teacher1, subject1, lessonsData, nonExistentId, newDescription, invalidIdUrl, semester1, schoolYear1, className1, emptyString } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('lessonsRouter', () => {
    afterEach(async () => {
        await prisma.lessons.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.semesters.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createLessons() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
    });

    test('createLessons() - validation error', async () => {
        const createLessonsResponse = await sendPostRequest('/lesson', {
            startDate: emptyString,
            endDate: emptyString,
            teacherId: emptyString,
            classId: emptyString,
            subjectId: emptyString,
            lessonSchedules: [
                {
                    dayOfWeek: 7,
                    startTime: emptyString,
                    endTime: emptyString,
                    frequency: emptyString
                }
            ],
        });
        assert.strictEqual(createLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createLessonsResponse.body.errors.length, 10, 'Expected the number of validation errors to be 10.');
    });

    test('createLessons() - teacher does not exist', async () => {
        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: nonExistentId,
            classId: nonExistentId,
            subjectId: nonExistentId,
            semesterId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });

    test('createLessons() - class does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: nonExistentId,
            subjectId: nonExistentId,
            semesterId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('createLessons() - subject does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: nonExistentId,
            semesterId: nonExistentId
        });
        assert.strictEqual(createLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('createLessons() - semester does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: nonExistentId
        });
        assert.strictEqual(createLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });

    test('createLessons() - lessons already exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const createLessonsResponse2 = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse2.statusCode, 409, 'Expected the status code to be 409 for lessons that already exists.');
    });

    test('getLessons() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });

    test('getLessons() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/${invalidIdUrl}/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('getLessons() - class does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/${nonExistentId}/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getLessons() - subject does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('updateLesson() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const updateLessonResponse = await sendPatchRequest(`/lesson/${lesson.id}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson update.');
        assert.strictEqual(updateLessonResponse.body.data.description, newDescription, `Expected the updated lesson description to be "${newDescription}".`);
    });

    test('updateLesson() - validation error', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${invalidIdUrl}`, {
            description: emptyString
        });
        assert.strictEqual(updateLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateLessonResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateLesson() - lesson does not exist', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${nonExistentId}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('deleteLessons() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        assert.strictEqual(deleteLessonsResponse.body.data, 6, 'Expected the number of deleted lessons to be 6.');
    });

    test('deleteLessons() - validation error', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${invalidIdUrl}/${invalidIdUrl}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('deleteLessons() - class does not exist', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${nonExistentId}/${nonExistentId}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('deleteLessons() - subject does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${createClassResponse.body.data.id}/${nonExistentId}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
});