import prisma from '../../src/db';
import test, { beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import { sendPostRequest, sendGetRequest, sendPatchRequest, sendDeleteRequest } from '../../src/utils/requestHelpers';

beforeEach(async () => {
    await prisma.students.deleteMany();
    await prisma.classes.deleteMany();
});

suite('classesRouter', () => {
    test('createClass() - success', async () => {
        const response = await sendPostRequest('/class', {
            'name': 'IA',
            'yearbook': '2024/2025'
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.data.name, 'IA');
        assert.strictEqual(response.body.data.yearbook, '2024/2025');
    });

    test('createClass() - validation error', async () => {
        const response = await sendPostRequest('/class', {
            'name': '',
            'yearbook': ''
        });

        assert.strictEqual(response.statusCode, 400);
    });

    test('createClass() - class exists', async () => {
        await sendPostRequest('/class', {
            'name': 'IA',
            'yearbook': '2024/2025'
        });

        const response = await sendPostRequest('/class', {
            'name': 'IA',
            'yearbook': '2024/2025'
        });

        assert.strictEqual(response.statusCode, 409);
    });

    test('getClasses() - success', async () => {
        await sendPostRequest('/class', {
            name: 'IA',
            yearbook: '2024/2025'
        });

        await sendPostRequest('/class', {
            name: 'IIA',
            yearbook: '2024/2025'
        });

        const response = await sendGetRequest('/class',);
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
            yearbook: '2024/2025'
        });

        const signUpResponse = await sendPostRequest('/auth/signup/student', {
            'pesel': '11111111111',
            'email': 'student@example.com',
            'phoneNumber': '601234567',
            'password': 'password',
            'passwordConfirm': 'password',
            'firstName': 'Student',
            'lastName': 'Student'
        });

        const assignStudentResponse = await sendPatchRequest(`/class/${createClassResponse.body.data.id}/assign-student`, {
            studentId: signUpResponse.body.data
        });

        const getStudentsResponse = await sendGetRequest(`/class/${createClassResponse.body.data.id}/students`);

        assert.strictEqual(getStudentsResponse.statusCode, 200);
        assert.strictEqual(getStudentsResponse.body.data.length, 1);
        assert.strictEqual(getStudentsResponse.body.data[0].pesel, '11111111111');
    });

    test('getStudents() - validation error', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66'
        const getStudentsResponse = await sendGetRequest(`/class/${invalidId}/students`);

        assert.strictEqual(getStudentsResponse.statusCode, 404);
    });
});