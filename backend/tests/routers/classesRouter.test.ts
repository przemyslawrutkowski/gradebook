import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { class1, class2, student1, student2, teacher1, invalidClass, nonExistentId, invalidIdUrl, invalidIdBody, invalidClassUpdate } from '../../src/utils/testData';

suite('classesRouter', () => {
    afterEach(async () => {
        await prisma.students.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
    });

    test('createClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        assert.strictEqual(createClassResponse.body.data.name, class1.name, `Expected the class name to be "${class1.name}".`);
        assert.strictEqual(createClassResponse.body.data.yearbook, class1.yearbook, `Expected the yearbook to be "${class1.yearbook}".`);
    });

    test('createClass() - validation error', async () => {
        const createClassResponse = await sendPostRequest('/class', invalidClass);
        assert.strictEqual(createClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('createClass() - class already exists', async () => {
        const createClassResponse1 = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createClassResponse2 = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse2.statusCode, 409, 'Expected the status code to be 409 for a class that already exists.');
    });

    test('getClasses() - success', async () => {
        const createClassResponse1 = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createClassResponse2 = await sendPostRequest('/class', class2);
        assert.strictEqual(createClassResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getClassesResponse = await sendGetRequest('/class');
        assert.strictEqual(getClassesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful classes retrieval.');
        assert.strictEqual(getClassesResponse.body.data.length, 2, 'Expected the number of retrieved classes to be 2.');
    });

    test('getStudents() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const assignStudentResponse1 = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            { studentId: signUpResponse1.body.data }
        );
        assert.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const assignStudentResponse2 = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const getStudentsResponse = await sendGetRequest(`/class/${createClassResponse.body.data.id}/students`);
        assert.strictEqual(getStudentsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful students retrieval.');
        assert.strictEqual(getStudentsResponse.body.data.length, 2, 'Expected the number of retrieved students to be 2.');
    });

    test('getStudents() - validation error', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/${invalidIdUrl}/students`);
        assert.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getStudents() - class does not exist', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/${nonExistentId}/students`);
        assert.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('updateClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                name: class2.name,
                yearbook: class2.yearbook,
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        assert.strictEqual(updateClassResponse.body.data.name, class2.name, `Expected the updated class name to be "${class2.name}".`);
        assert.strictEqual(updateClassResponse.body.data.yearbook, class2.yearbook, `Expected the updated yearbook to be "${class2.yearbook}".`);
        assert.strictEqual(updateClassResponse.body.data.teacher_id, signUpResponse.body.data, 'Expected the updated teacher ID to match the created teacher ID.');
    });

    test('updateClass() - validation error', async () => {
        const updateClassResponse = await sendPatchRequest(`/class/${invalidIdUrl}`, invalidClassUpdate);
        assert.strictEqual(updateClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateClass() - class does not exist', async () => {
        const updateClassResponse = await sendPatchRequest(
            `/class/${nonExistentId}`,
            {
                name: class1.name,
                yearbook: class1.yearbook
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('updateClass() - teacher does not exist', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            { teacherId: nonExistentId }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });

    test('assignStudent() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            { studentId: signUpResponse.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        assert.strictEqual(assignStudentResponse.body.data.class_id, createClassResponse.body.data.id, 'Expected the assigned student to be in the correct class.');
    });

    test('assignStudent() - validation error', async () => {
        const assignStudentResponse = await sendPatchRequest(
            `/class/${invalidIdUrl}/assign-student`,
            { studentId: invalidIdBody }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(assignStudentResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('assignStudent() - class does not exist', async () => {
        const assignStudentResponse = await sendPatchRequest(
            `/class/${nonExistentId}/assign-student`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('assignStudent() - student does not exist', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('deleteClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const deleteClassResponse = await sendDeleteRequest(`/class/${createClassResponse.body.data.id}`);
        assert.strictEqual(deleteClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class deletion.');
        assert.strictEqual(deleteClassResponse.body.data.id, createClassResponse.body.data.id, 'Expected the deleted class ID to match the created class ID.');
    });

    test('deleteClass() - validation error', async () => {
        const deleteClassResponse = await sendDeleteRequest(`/class/${invalidIdUrl}`);
        assert.strictEqual(deleteClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteClassResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteClass() - class does not exist', async () => {
        const deleteClassResponse = await sendDeleteRequest(`/class/${nonExistentId}`);
        assert.strictEqual(deleteClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
});