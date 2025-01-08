import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
    sendGetRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, status1, status2 } from '../../src/utils/testData';

suite('statusesRouter', () => {
    afterEach(async () => {
        await prisma.statuses.deleteMany();
    });

    test('createStatus() - success', async () => {
        const createStatusResponse = await sendPostRequest('/status', status1);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        assert.strictEqual(createStatusResponse.body.data.name, status1.name, `Expected the status name to be "${status1.name}".`);
    });

    test('createStatus() - validation error', async () => {
        const createStatusResponse = await sendPostRequest('/status', {
            name: emptyString
        });
        assert.strictEqual(createStatusResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createStatusResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createStatus() - status already exists', async () => {
        const createStatusResponse1 = await sendPostRequest('/status', status1);
        assert.strictEqual(createStatusResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createStatusResponse2 = await sendPostRequest('/status', status1);
        assert.strictEqual(createStatusResponse2.statusCode, 409, 'Expected the status code to be 409 for a status that already exists.');
    });

    test('getStatus() - success', async () => {
        const createStatusResponse1 = await sendPostRequest('/status', status1);
        assert.strictEqual(createStatusResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createStatusResponse2 = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const getStatusesResponse = await sendGetRequest('/status');
        assert.strictEqual(getStatusesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful statuses retrieval.');
        assert.strictEqual(getStatusesResponse.body.data.length, 2, 'Expected the number of retrieved statuses to be 2.');
    });

    test('deleteStatus() - success', async () => {
        const createStatusResponse = await sendPostRequest('/status', status1);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const deleteStatusResponse = await sendDeleteRequest(`/status/${createStatusResponse.body.data.id}`);
        assert.strictEqual(deleteStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status deletion.');
        assert.strictEqual(deleteStatusResponse.body.data.id, createStatusResponse.body.data.id, 'Expected the deleted status ID to match the created status ID.');
    });

    test('deleteStatus() - validation error', async () => {
        const deleteStatusResponse = await sendDeleteRequest(`/status/${invalidIdUrl}`);
        assert.strictEqual(deleteStatusResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteStatusResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteStatus() - status does not exist', async () => {
        const deleteStatusResponse = await sendDeleteRequest(`/status/${nonExistentId}`);
        assert.strictEqual(deleteStatusResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });
});