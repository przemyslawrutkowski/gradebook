import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { subject1, subject2 } from '../../src/utils/testData';

suite('subjectsRouter', () => {
    afterEach(async () => {
        await prisma.subjects.deleteMany();
    });

    test('createSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for the successful subject creation');
        assert.strictEqual(createSubjectResponse.body.data.name, subject1.name, `Expected the subject name to be "${subject1.name}"`);
    });

    test('createSubject() - validation error', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', {
            name: '',
        });

        assert.strictEqual(createSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(createSubjectResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1');
    });

    test('createSubject() - subject exists', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for the successful subject creation');

        const createSubjectResponse2 = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse2.statusCode, 409, 'Expected the status code to be 409 for the subject already exists');
    });

    test('getSubjects() - success', async () => {
        const createSubjectResponse1 = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for the first successful subject creation');

        const createSubjectResponse2 = await sendPostRequest('/subject', subject2);

        assert.strictEqual(createSubjectResponse2.statusCode, 200, 'Expected the status code to be 200 for the second successful subject creation');

        const getSubjectsResponse = await sendGetRequest('/subject');

        assert.strictEqual(getSubjectsResponse.statusCode, 200, 'Expected the status code to be 200 for getting the subjects');
        assert.strictEqual(getSubjectsResponse.body.data.length, 2, 'Expected the number of subjects in the response to be 2');
    });

    test('updateSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for the successful subject creation');

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${createSubjectResponse.body.data.id}`,
            {
                name: subject2.name,
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 200, 'Expected the status code to be 200 for the successful subject update');
        assert.strictEqual(updateSubjectReponse.body.data.name, subject2.name, `Expected the updated subject name to be "${subject2.name}"`);
    });

    test('updateSubject() - validation error', async () => {
        const invalidId = '%20';

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${invalidId}`,
            {
                name: '',
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(updateSubjectReponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('updateSubject() - subject does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const updateSubjectReponse = await sendPatchRequest(
            `/subject/${invalidId}`,
            {
                name: subject1.name,
            }
        );

        assert.strictEqual(updateSubjectReponse.statusCode, 404, 'Expected the status code to be 404 for the subject not found');
    });

    test('deleteSubject() - success', async () => {
        const createSubjectResponse = await sendPostRequest('/subject', subject1);

        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for the successful subject creation');

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${createSubjectResponse.body.data.id}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 200, 'Expected the status code to be 200 for the successful subject deletion');
        assert.strictEqual(deleteSubjectReponse.body.data.id, createSubjectResponse.body.data.id, 'Expected the deleted subject ID to match the created subject ID');
    });

    test('deleteSubject() - validation error', async () => {
        const invalidId = '%20';

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${invalidId}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(deleteSubjectReponse.body.errors.length, 1, 'Expected the number of validation errors to be 1');
    });

    test('deleteSubject() - subject does not exist', async () => {
        const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

        const deleteSubjectReponse = await sendDeleteRequest(`/subject/${invalidId}`);

        assert.strictEqual(deleteSubjectReponse.statusCode, 404, 'Expected the status code to be 404 for the subject not found');
    });
});