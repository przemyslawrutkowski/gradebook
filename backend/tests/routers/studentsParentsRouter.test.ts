import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { student1, parent1, nonExistentId, invalidIdBody, invalidIdUrl } from '../../src/utils/testData';

suite('studentsParentsRouter', () => {
    afterEach(async () => {
        await prisma.students_parents.deleteMany();
        await prisma.students.deleteMany();
        await prisma.parents.deleteMany();
    });

    test('createStudentParentRelationship() - success', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);
        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });
        assert.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        assert.strictEqual(createRelationshipResponse.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID.');
        assert.strictEqual(createRelationshipResponse.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID.');
    });

    test('createStudentParentRelationship() - validation error', async () => {
        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: invalidIdBody,
            parentId: invalidIdBody
        });
        assert.strictEqual(createRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('createStudentParentRelationship() - student does not exist', async () => {
        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: nonExistentId,
            parentId: nonExistentId
        });
        assert.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('createStudentParentRelationship() - parent does not exist', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: nonExistentId
        });
        assert.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a parent that does not exist.');
    });

    test('createStudentParentRelationship() - parent already assigned to student', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);
        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');

        const createRelationshipResponse1 = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });
        assert.strictEqual(createRelationshipResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        assert.strictEqual(createRelationshipResponse1.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID.');
        assert.strictEqual(createRelationshipResponse1.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID.');

        const createRelationshipResponse2 = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });
        assert.strictEqual(createRelationshipResponse2.statusCode, 409, 'Expected the status code to be 409 for a student-parent relationship that already exists.');
    });

    test('deleteStudentParentRelationship() - success', async () => {
        const studentSignUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(studentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const parentSignUpResponse = await sendPostRequest('/auth/signup/parent', parent1);
        assert.strictEqual(parentSignUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');

        const createRelationshipResponse = await sendPostRequest('/student-parent/student-parent-relationship', {
            studentId: studentSignUpResponse.body.data,
            parentId: parentSignUpResponse.body.data
        });
        assert.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        assert.strictEqual(createRelationshipResponse.body.data.student_id, studentSignUpResponse.body.data, 'Expected the student ID in the relationship to match the created student ID.');
        assert.strictEqual(createRelationshipResponse.body.data.parent_id, parentSignUpResponse.body.data, 'Expected the parent ID in the relationship to match the created parent ID.');

        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${studentSignUpResponse.body.data}/${parentSignUpResponse.body.data}`);
        assert.strictEqual(deleteRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful relationship deletion.');
        assert.strictEqual(deleteRelationshipResponse.body.data.student_id, createRelationshipResponse.body.data.student_id, 'Expected the deleted student ID to match the created student ID.');
        assert.strictEqual(deleteRelationshipResponse.body.data.parent_id, createRelationshipResponse.body.data.parent_id, 'Expected the deleted parent ID to match the created parent ID.');
    });

    test('deleteStudentParentRelationship() - validation error', async () => {
        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${invalidIdUrl}/${invalidIdUrl}`);
        assert.strictEqual(deleteRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('deleteStudentParentRelationship() - relationship does not exist', async () => {
        const deleteRelationshipResponse = await sendDeleteRequest(`/student-parent/student-parent-relationship/${nonExistentId}/${nonExistentId}`);
        assert.strictEqual(deleteRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a relationship that does not exist.');
    });
});