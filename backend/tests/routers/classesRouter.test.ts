import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { class1, class2, student1, student2, teacher1 } from '../../src/utils/testData';

suite('classesRouter', () => {
    afterEach(async () => {
        await prisma.students.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
    });

    test('createClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');
        assert.strictEqual(createClassResponse.body.data.name, class1.name, `Expected the class name to be "${class1.name}"`);
        assert.strictEqual(createClassResponse.body.data.yearbook, class1.yearbook, `Expected the yearbook to be "${class1.yearbook}"`);
    });

    test('createClass() - validation error', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            name: '',
            yearbook: '',
        });

        assert.strictEqual(createClassResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(createClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('createClass() - class exists', async () => {
        const createClassResponse1 = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const createClassResponse2 = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse2.statusCode, 409, 'Expected the status code to be 409 for the class already exists');
    });

    test('getClasses() - success', async () => {
        const createClassResponse1 = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for the first successful class creation');

        const createClassResponse2 = await sendPostRequest('/class', class2);

        assert.strictEqual(createClassResponse2.statusCode, 200, 'Expected the status code to be 200 for the second successful class creation');

        const getClassesResponse = await sendGetRequest('/class');

        assert.strictEqual(getClassesResponse.statusCode, 200, 'Expected the status code to be 200 for getting the classes');
        assert.strictEqual(getClassesResponse.body.data.length, 2, 'Expected the number of classes in the response to be 2');
    });

    test('getStudents() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for the first successful student signup');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);

        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for the second successful student signup');

        const assignStudentResponse1 = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: signUpResponse1.body.data,
            }
        );

        assert.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for the first successful student assignment');

        const assignStudentResponse2 = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: signUpResponse2.body.data,
            }
        );

        assert.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for the second successful student assignment');

        const getStudentsResponse = await sendGetRequest(
            `/class/${createClassResponse.body.data.id}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 200, 'Expected the status code to be 200 for getting the students');
        assert.strictEqual(getStudentsResponse.body.data.length, 2, 'Expected the number of students in the response to be 2');
    });

    test('getStudents() - validation error', async () => {
        const invalidId = '%20';

        const getStudentsResponse = await sendGetRequest(
            `/class/${invalidId}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1');
    });

    test('getStudents() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const getStudentsResponse = await sendGetRequest(
            `/class/${invalidId}/students`
        );

        assert.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for the class not found');
    });

    test('updateClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful teacher signup');

        const updateClassReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                name: class2.name,
                yearbook: class2.yearbook,
                teacherId: signUpResponse.body.data,
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 200, 'Expected the status code to be 200 for the successful class update');
        assert.strictEqual(updateClassReponse.body.data.name, class2.name, `Expected the updated class name to be "${class2.name}"`);
        assert.strictEqual(updateClassReponse.body.data.yearbook, class2.yearbook, `Expected the updated yearbook to be "${class2.yearbook}"`);
        assert.strictEqual(updateClassReponse.body.data.teacher_id, signUpResponse.body.data, 'Expected the updated teacher ID to match the created teacher ID');
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

        assert.strictEqual(updateClassReponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(updateClassReponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('updateClass() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const updateClassReponse = await sendPatchRequest(
            `/class/${invalidId}`,
            {
                name: class2.name,
                yearbook: class2.yearbook
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 404, 'Expected the status code to be 404 for the class not found');
    });

    test('updateClass() - teacher does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const updateClassReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: invalidId
            }
        );

        assert.strictEqual(updateClassReponse.statusCode, 404, 'Expected the status code to be 404 for the teacher not found');
    });

    test('assignStudent() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful student signup');

        const assignStudentReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: signUpResponse.body.data
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 200, 'Expected the status code to be 200 for the successful student assignment');
        assert.strictEqual(assignStudentReponse.body.data.class_id, createClassResponse.body.data.id, 'Expected the assigned student to be in the correct class');
    });

    test('assignStudent() - validation error', async () => {
        const invalidClassId = '%20';

        const assignStudentReponse = await sendPatchRequest(
            `/class/${invalidClassId}/assign-student`,
            {
                studentId: ''
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(assignStudentReponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('assignStudent() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const assignStudentReponse = await sendPatchRequest(
            `/class/${invalidId}/assign-student`,
            {
                studentId: invalidId
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 404, 'Expected the status code to be 404 for the class not found');
    });

    test('assignStudent() - student does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const assignStudentReponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}/assign-student`,
            {
                studentId: invalidId
            }
        );

        assert.strictEqual(assignStudentReponse.statusCode, 404, 'Expected the status code to be 404 for the student not found');
    });

    test('deleteClass() - success', async () => {
        const createClassResponse = await sendPostRequest('/class', class1);

        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for the successful class creation');

        const deleteClassReponse = await sendDeleteRequest(`/class/${createClassResponse.body.data.id}`);

        assert.strictEqual(deleteClassReponse.statusCode, 200, 'Expected the status code to be 200 for the successful class deletion');
        assert.strictEqual(deleteClassReponse.body.data.id, createClassResponse.body.data.id, 'Expected the deleted class ID to match the created class ID');
    });

    test('deleteClass() - validation error', async () => {
        const invalidId = '%20';

        const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

        assert.strictEqual(deleteClassReponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(deleteClassReponse.body.errors.length, 1, 'Expected the number of validation errors to be 1');
    });

    test('deleteClass() - class does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

        assert.strictEqual(deleteClassReponse.statusCode, 404, 'Expected the status code to be 404 for the class not found');
    });
});