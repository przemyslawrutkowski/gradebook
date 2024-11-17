import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { subject1, subject2, nonExistentId, invalidIdUrl, emptyString } from '../../src/utils/testData';

suite('subjectsRouter', () => {
    afterEach(async () => {
        await prisma.subjects.deleteMany();
    });

    test('createSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        assert.strictEqual(createSubjectResponse.body.data.name, subject1.name, `Expected the subject name to be "${subject1.name}".`);
    });

    test('createSubject() - validation error', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: emptyString
        });
        assert.strictEqual(createSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createSubjectResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createSubject() - subject already exists', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSubjectResponse2 = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse2.statusCode, 409, 'Expected the status code to be 409 for a subject that already exists.');
    });

    test('getSubjects() - success', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSubjectResponse2 = await sendPostRequest('/subject', subject2);
        assert.strictEqual(createSubjectResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const getSubjectsResponse = await sendGetRequest('/subject');
        assert.strictEqual(getSubjectsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subjects retrieval.');
        assert.strictEqual(getSubjectsResponse.body.data.length, 2, 'Expected the number of subjects in the response to be 2.');
    });

    test('updateSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const updateSubjectResponse = await sendPatchRequest(
            `/subject/${createSubjectResponse.body.data.id}`,
            { name: subject2.name }
        );
        assert.strictEqual(updateSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject update.');
        assert.strictEqual(updateSubjectResponse.body.data.name, subject2.name, `Expected the updated subject name to be "${subject2.name}".`);
    });

    test('updateSubject() - validation error', async () => {
        const updateSubjectResponse = await sendPatchRequest(
            `/subject/${invalidIdUrl}`, {
            name: emptyString
        });
        assert.strictEqual(updateSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateSubjectResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateSubject() - subject does not exist', async () => {
        const updateSubjectResponse = await sendPatchRequest(
            `/subject/${nonExistentId}`,
            { name: subject1.name }
        );
        assert.strictEqual(updateSubjectResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('deleteSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const deleteSubjectResponse = await sendDeleteRequest(`/subject/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(deleteSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject deletion.');
        assert.strictEqual(deleteSubjectResponse.body.data.id, createSubjectResponse.body.data.id, 'Expected the deleted subject ID to match the created subject ID.');
    });

    test('deleteSubject() - validation error', async () => {
        const deleteSubjectResponse = await sendDeleteRequest(`/subject/${invalidIdUrl}`);
        assert.strictEqual(deleteSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteSubjectResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteSubject() - subject does not exist', async () => {
        const deleteSubjectResponse = await sendDeleteRequest(`/subject/${nonExistentId}`);
        assert.strictEqual(deleteSubjectResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
});