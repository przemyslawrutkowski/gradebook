import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
    sendPatchRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, update1, update2 } from '../../src/utils/testData';

suite('updatesRouter', () => {
    afterEach(async () => {
        await prisma.updates.deleteMany();
    });

    test('createUpdate() - success', async () => {
        const createUpdateResponse = await sendPostRequest('/update', update1);
        assert.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');
        assert.strictEqual(createUpdateResponse.body.data.description, update1.description, `Expected the description to be "${update1.description}".`);
        assert.strictEqual(createUpdateResponse.body.data.version, update1.version, `Expected the version to be "${update1.version}".`);
    });

    test('createUpdate() - validation error', async () => {
        const createUpdateResponse = await sendPostRequest('/update', {
            description: emptyString,
            version: emptyString
        });
        assert.strictEqual(createUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createUpdateResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('createUpdate() - update already exists', async () => {
        const createUpdateResponse1 = await sendPostRequest('/update', update1);
        assert.strictEqual(createUpdateResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');

        const createUpdateResponse2 = await sendPostRequest('/update', update1);
        assert.strictEqual(createUpdateResponse2.statusCode, 409, 'Expected the status code to be 409 for an update that already exists.');

    });

    test('updateUpdate() - success', async () => {
        const createUpdateResponse = await sendPostRequest('/update', update1);
        assert.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');

        const updateUpdateResponse = await sendPatchRequest(`/update/${createUpdateResponse.body.data.id}`, {
            description: update2.description,
            version: update2.version
        });
        assert.strictEqual(updateUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update update.');
        assert.strictEqual(updateUpdateResponse.body.data.description, update2.description, `Expected the description to be "${update2.description}".`);
        assert.strictEqual(updateUpdateResponse.body.data.version, update2.version, `Expected the version to be "${update2.version}".`);
    });

    test('updateUpdate() - validation error', async () => {
        const updateUpdateResponse = await sendPatchRequest(`/update/${invalidIdUrl}`, {
            description: emptyString,
            version: emptyString
        });
        assert.strictEqual(updateUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateUpdateResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateUpdate() - update does not exist', async () => {
        const updateUpdateResponse = await sendPatchRequest(`/update/${nonExistentId}`, {
            description: update2.description,
            version: update2.version
        });
        assert.strictEqual(updateUpdateResponse.statusCode, 404, 'Expected the status code to be 404 for an update that does not exist.');
    });

    test('deleteUpdate() - success', async () => {
        const createUpdateResponse = await sendPostRequest('/update', update1);
        assert.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');

        const deleteUpdateResponse = await sendDeleteRequest(`/update/${createUpdateResponse.body.data.id}`);
        assert.strictEqual(deleteUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update deletion.');
        assert.strictEqual(deleteUpdateResponse.body.data.id, createUpdateResponse.body.data.id, 'Expected the deleted update ID to match the created update ID.');
    });

    test('deleteUpdate() - validation error', async () => {
        const deleteUpdateResponse = await sendDeleteRequest(`/update/${invalidIdUrl}`);
        assert.strictEqual(deleteUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteUpdateResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteUpdate() - update does not exist', async () => {
        const deleteUpdateResponse = await sendDeleteRequest(`/update/${nonExistentId}`);
        assert.strictEqual(deleteUpdateResponse.statusCode, 404, 'Expected the status code to be 404 for an update that does not exist.');
    });
});