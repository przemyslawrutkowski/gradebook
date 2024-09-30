import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';

suite('subjectsRouter', () => {
    afterEach(async () => {
        await prisma.subjects.deleteMany();
    });

    test('createSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: 'Math',
        });

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected status code 200 for successful subject creation');
        assert.strictEqual(createSubjectResponse.body.data.name, 'Math', 'Expected subject name to be "Math"');
    });

    test('createSubject() - validation error', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: '',
        });

        assert.strictEqual(createSubjectResponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(createSubjectResponse.body.errors.length, 1, 'Expected 1 validation error');
    });

    test('createSubject() - subject exists', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', {
            name: 'Math'
        });

        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected status code 200 for successful subject creation');

        const createSubjectResponse2 = await sendPostRequest('/subject', {
            name: 'Math'
        });

        assert.strictEqual(createSubjectResponse2.statusCode, 409, 'Expected status code 409 for subject already exists');
    });

    test('getSubjects() - success', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', {
            name: 'Math',
        });

        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected status code 200 for first successful subject creation');

        const createSubjectResponse2 = await sendPostRequest('/subject', {
            name: 'Geography',
        });

        assert.strictEqual(createSubjectResponse2.statusCode, 200, 'Expected status code 200 for second successful subject creation');

        const getSubjectsResponse = await sendGetRequest('/subject');

        assert.strictEqual(getSubjectsResponse.statusCode, 200, 'Expected status code 200 for getting subjects');
        assert.strictEqual(getSubjectsResponse.body.data.length, 2, 'Expected 2 subjects in the response');
    });

    test('updateSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: 'Math',
        });

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected status code 200 for successful subject creation');

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${createSubjectResponse.body.data.id}`,
            {
                name: 'Geography',
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 200, 'Expected status code 200 for successful subject update');
        assert.strictEqual(updateSubjectReponse.body.data.name, 'Geography', 'Expected updated subject name to be "Geography"');
    });

    test('updateSubject() - validation error', async () => {
        const invalidId = '%20';

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${invalidId}`,
            {
                name: '',
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(updateSubjectReponse.body.errors.length, 2, 'Expected 2 validation errors');
    });

    test('updateSubject() - subject does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${invalidId}`,
            {
                name: 'Math',
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 404, 'Expected status code 404 for subject not found');
    });

    test('deleteSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: 'Math',
        });

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected status code 200 for successful subject creation');

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${createSubjectResponse.body.data.id}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 200, 'Expected status code 200 for successful subject deletion');
        assert.strictEqual(deleteSubjectReponse.body.data.id, createSubjectResponse.body.data.id, 'Expected deleted subject ID to match created subject ID');
    });

    test('deleteSubject() - validation error', async () => {
        const invalidId = '%20';

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${invalidId}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(deleteSubjectReponse.body.errors.length, 1, 'Expected 1 validation error');
    });

    test('deleteSubject() - subject does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${invalidId}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 404, 'Expected status code 404 for subject not found');
    });
});