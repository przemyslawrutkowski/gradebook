import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { student1, parent1 } from '../../src/utils/testData';

suite('studentsParentsRouter', () => {
    afterEach(async () => {
        await prisma.students_parents.deleteMany();
        await prisma.students.deleteMany();
        await prisma.parents.deleteMany();
    });

    test('createStudentParentRelationship() - success', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful student signup');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);

        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful parent signup');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });

        assert.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for the successful assignment');
        assert.strictEqual(createRelationshipResponse.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID');
        assert.strictEqual(createRelationshipResponse.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID');
    });

    test('createStudentParentRelationship() - validation error', async () => {
        const invalidId = '';

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: invalidId,
            parentId: invalidId
        });

        assert.strictEqual(createRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(createRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('createStudentParentRelationship() - student does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: invalidId,
            parentId: invalidId
        });

        assert.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for the student not found');
    });

    test('createStudentParentRelationship() - parent does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful student signup');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: invalidId
        });

        assert.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for the parent not found');
    });

    test('createStudentParentRelationship() - parent already assigned to student', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful student signup');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);

        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful parent signup');

        const createRelationshipResponse1 = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });

        assert.strictEqual(createRelationshipResponse1.statusCode, 200, 'Expected the status code to be 200 for the successful assignment');
        assert.strictEqual(createRelationshipResponse1.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID');
        assert.strictEqual(createRelationshipResponse1.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID');

        const createRelationshipResponse2 = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });

        assert.strictEqual(createRelationshipResponse2.statusCode, 409, 'Expected the status code to be 409 for the student-parent relationship already exists');
    });

    test('deleteStudentParentRelationship() - success', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);

        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful student signup');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);

        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful parent signup');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });

        assert.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for the successful assignment');
        assert.strictEqual(createRelationshipResponse.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID');
        assert.strictEqual(createRelationshipResponse.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID');

        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${studentSignUpResponse.body.data}/${parentSignUpResponse.body.data}`);

        assert.strictEqual(deleteRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for the successful relationship deletion');
        assert.strictEqual(deleteRelationshipResponse.body.data.student_id, createRelationshipResponse.body.data.student_id, 'Expected the deleted student ID to match the created student ID');
        assert.strictEqual(deleteRelationshipResponse.body.data.parent_id, createRelationshipResponse.body.data.parent_id, 'Expected the deleted parent ID to match the created parent ID');
    });

    test('deleteStudentParentRelationship() - validation error', async () => {
        const invalidId = '%20';

        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${invalidId}/${invalidId}`);

        assert.strictEqual(deleteRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(deleteRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('deleteStudentParentRelationship() - relationship does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${invalidId}/${invalidId}`);

        assert.strictEqual(deleteRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for the relationship not found');
    });
});