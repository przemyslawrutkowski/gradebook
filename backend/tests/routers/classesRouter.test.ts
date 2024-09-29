import prisma from '../../src/db';
import test, { beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';

beforeEach(async () => {
    await prisma.students.deleteMany();
    await prisma.classes.deleteMany();
    await prisma.teachers.deleteMany();
});

suite('classesRouter', () => {
    test('createClass() - success', async () => {
        const response = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.data.name, 'IA');
        assert.strictEqual(response.body.data.yearbook, '2024/2025');
    });

    test('createClass() - validation error', async () => {
        const response = await sendPostRequest('/class', {
            name: '',
            yearbook: '',
        });

        assert.strictEqual(response.statusCode, 400);
    });

    test('createClass() - class exists', async () => {
        await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const response = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        assert.strictEqual(response.statusCode, 409);
    });

    test('getClasses() - success', async () => {
        await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        await sendPostRequest('/class', {
            name: 'IIA',
            yearbook: '2024/2025',
        });

        const response = await sendGetRequest('/class');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.data.length, 2);
        assert.strictEqual(response.body.data[0].name, 'IA');
        assert.strictEqual(response.body.data[0].yearbook, '2024/2025');
        assert.strictEqual(response.body.data[1].name, 'IIA');
        assert.strictEqual(response.body.data[1].yearbook, '2024/2025');
    });

    test('getStudents() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const signUpResponse = await sendPostRequest('/auth/signup/student', {
            pesel: '11111111111',
            email: 'student@example.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Student',
            lastName: 'Student',
        });

        const assignStudentResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: signUpResponse.body.data,
            }
        );

        const getStudentsResponse = await sendGetRequest(
            `/class/${createClassResponse.body.data.id}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 200);
        assert.strictEqual(getStudentsResponse.body.data.length, 1);
    });

    test('getStudents() - validation error', async () => {
        const invalidId = '%20';

        const getStudentsResponse = await sendGetRequest(
            `/class/${invalidId}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 400);
    });

    test('getStudents() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const getStudentsResponse = await sendGetRequest(
            `/class/${invalidId}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 404);
    });

    test('updateClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const signUpResponse = await sendPostRequest('/auth/signup/teacher', {
            pesel: '11111111111',
            email: 'teacher@teacher.com',
            phoneNumber: '555555555',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'John',
            lastName: 'Doe',
        });

        const updateClassReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                name: 'IIA',
                yearbook: '2025/2026',
                teacherId: signUpResponse.body.data,
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 200);
        assert.strictEqual(updateClassReponse.body.data.name, 'IIA');
        assert.strictEqual(updateClassReponse.body.data.yearbook, '2025/2026');
        assert.strictEqual(updateClassReponse.body.data.teacher_id, signUpResponse.body.data);
    });

    test('updateClass() - validation error', async () => {
        const invalidId = '%20';

        const updateClassReponse = await sendPatchRequest(
            `/class/${invalidId}`,
            {
                name: '',
                yearbook: '',
                teacherId: ''
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 400);
    });

    test('updateClass() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const updateClassReponse = await sendPatchRequest(
            `/class/${invalidId}`,
            {
                name: 'IIA',
                yearbook: '2025/2026'
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 404);
    });

    test('updateClass() - teacher does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const updateClassReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: invalidId
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 404);
    });

    test('assignStudent() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const signUpResponse = await sendPostRequest('/auth/signup/student', {
            pesel: '11111111111',
            email: 'student@student.com',
            phoneNumber: '555555555',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'John',
            lastName: 'Doe',
        });

        const assignStudentReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: signUpResponse.body.data
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 200);
        assert.strictEqual(assignStudentReponse.body.data.class_id, createClassResponse.body.data.id);
    });

    test('assignStudent() - validation error', async () => {
        const invalidClassId = '%20';

        const assignStudentReponse = await sendPatchRequest(
            `/class/${invalidClassId}/assign-student`,
            {
                studentId: ''
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 400);
    });

    test('assignStudent() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const assignStudentReponse = await sendPatchRequest(
            `/class/${invalidId}/assign-student`,
            {
                studentId: invalidId
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 404);
    });

    test('assignStudent() - student does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const assignStudentReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: invalidId
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 404);
    });

    test('deleteClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025',
        });

        const deleteClassReponse = await sendDeleteRequest(`/class/${createClassResponse.body.data.id}`);

        assert.strictEqual(deleteClassReponse.statusCode, 200);
        assert.strictEqual(deleteClassReponse.body.data.id, createClassResponse.body.data.id);
    });

    test('deleteClass() - validation error', async () => {
        const invalidId = '%20';

        const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

        assert.strictEqual(deleteClassReponse.statusCode, 400);
    });

    test('deleteClass() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

        assert.strictEqual(deleteClassReponse.statusCode, 404);
    });
});