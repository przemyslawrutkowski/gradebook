import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { teacher1, class1, subject1, invalidLessonsData, lessonsData, nonExistentId, newDescription, invalidIdUrl, invalidLessonUpdate } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('lessonsRouter', () => {
    afterEach(async () => {
        await prisma.lessons.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
    });

    test('generateLessons() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');
        assert.strictEqual(generateLessonsResponse.body.data, 6, 'Expected the number of generated lessons to be 6.');
    });

    test('generateLessons() - validation error', async () => {
        const generateLessonsResponse = await sendPostRequest('/lesson', invalidLessonsData);
        assert.strictEqual(generateLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(generateLessonsResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9.');
    });

    test('generateLessons() - teacher does not exist', async () => {
        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: nonExistentId,
            classId: nonExistentId,
            subjectId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });

    test('generateLessons() - class does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: nonExistentId,
            subjectId: nonExistentId,
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('generateLessons() - subject does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('getLessons() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

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
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('updateLesson() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const updateLessonResponse = await sendPatchRequest(`/lesson/${lesson.id}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson update.');
        assert.strictEqual(updateLessonResponse.body.data.description, newDescription, `Expected the updated lesson description to be "${newDescription}".`);
    });

    test('updateLesson() - validation error', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${invalidIdUrl}`, invalidLessonUpdate);
        assert.strictEqual(updateLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateLessonResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateLesson() - lesson does not exist', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${nonExistentId}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('deleteLesson() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        assert.strictEqual(deleteLessonsResponse.body.data, 6, 'Expected the number of deleted lessons to be 6.');
    });

    test('deleteLesson() - validation error', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/${invalidIdUrl}/${invalidIdUrl}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
});