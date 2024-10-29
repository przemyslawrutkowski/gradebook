import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest
} from '../../src/utils/requestHelpers';
import { class1, teacher1, subject1, student1, student2, lessonsData, invalidIdUrl, nonExistentId } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('attendancesRouter', () => {
    afterEach(async () => {
        await prisma.attendances.deleteMany();
        await prisma.lessons.deleteMany();
        await prisma.students.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
    });

    test('createAttendances() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse1.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse1.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            attendances: [
                {
                    wasPresent: true,
                    studentId: signUpResponse2.body.data,
                    lessonId: lesson.id
                },
                {
                    wasPresent: true,
                    studentId: signUpResponse3.body.data,
                    lessonId: lesson.id
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        assert.strictEqual(createAttendancesResponse.body.data, 2, `Expected the number of created attendances to be 2.`);
    });

    test('createAttendances() - validation error (attendances is an array)', async () => {
        const attendancesData = {
            attendances: [
                {
                    wasPresent: '',
                    studentId: '',
                    lessonId: ''
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createAttendancesResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });

    test('createAttendances() - validation error (attendances is not an array)', async () => {
        const attendancesData = {
            attendances: []
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createAttendancesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    //There is no such possibility of creating attendances list again

    test('getAttendances() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse1.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse1.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            attendances: [
                {
                    wasPresent: true,
                    studentId: signUpResponse2.body.data,
                    lessonId: lesson.id
                },
                {
                    wasPresent: true,
                    studentId: signUpResponse3.body.data,
                    lessonId: lesson.id
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesResponse = await sendGetRequest(`/attendance/${lesson.id}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });

    test('getAttendances() - validation error', async () => {
        const getAttendancesResponse = await sendGetRequest(`/attendance/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('updateAttendance() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse1.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData,
            teacherId: signUpResponse1.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons generation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            attendances: [
                {
                    wasPresent: true,
                    studentId: signUpResponse2.body.data,
                    lessonId: lesson.id
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const updatedAttendanceData = {
            wasPresent: false
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${lesson.id}/${signUpResponse2.body.data}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendance update.');
        assert.strictEqual(updateAttendanceResponse.body.data.was_present, false, `Expected the updated attendance presence to be "false".`);
    });

    test('updateAttendance() - validation error', async () => {
        const updatedAttendanceData = {
            wasPresent: false
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${invalidIdUrl}/${invalidIdUrl}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateAttendanceResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateAttendance() - attendance not found', async () => {
        const updatedAttendanceData = {
            wasPresent: false
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${nonExistentId}/${nonExistentId}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 404, 'Expected the status code to be 404 for a attendance that does not exist.');
    });
});