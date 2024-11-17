import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { className1, className2, nonExistentId, invalidIdUrl, emptyString } from '../../src/utils/testData';

suite('classNamesRouter', () => {
    afterEach(async () => {
        await prisma.class_names.deleteMany();
    });

    test('createClassName() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        assert.strictEqual(createClassNameResponse.body.data.name, className1.name, `Expected the class name to be "${className1.name}".`);
    });

    test('createClassName() - validation error', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', {
            name: emptyString
        });
        assert.strictEqual(createClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createClassNameResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createClassName() - class name already exists', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse2.statusCode, 409, 'Expected the status code to be 409 for a class name that already exists.');
    });

    test('getClassNames() - success', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className2);
        assert.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const getClassNamesResponse = await sendGetRequest('/class-name');
        assert.strictEqual(getClassNamesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class names retrieval.');
        assert.strictEqual(getClassNamesResponse.body.data.length, 2, 'Expected the number of class names in the response to be 2.');
    });

    test('updateClassName() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        0
        const updateClassNameResponse = await sendPatchRequest(
            `/class-name/${createClassNameResponse.body.data.id}`,
            { name: className2.name }
        );
        assert.strictEqual(updateClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name update.');
        assert.strictEqual(updateClassNameResponse.body.data.name, className2.name, `Expected the updated class name to be "${className2.name}".`);
    });

    test('updateClassName() - validation error', async () => {
        const updateClassNameResponse = await sendPatchRequest(
            `/class-name/${invalidIdUrl}`, {
            name: emptyString
        });
        assert.strictEqual(updateClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateClassNameResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateClassName() - class name does not exist', async () => {
        const updateClassNameResponse = await sendPatchRequest(
            `/class-name/${nonExistentId}`,
            { name: className2.name }
        );
        assert.strictEqual(updateClassNameResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });

    test('deleteClassName() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const deleteClassNameResponse = await sendDeleteRequest(`/class-name/${createClassNameResponse.body.data.id}`);
        assert.strictEqual(deleteClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name deletion.');
        assert.strictEqual(deleteClassNameResponse.body.data.id, createClassNameResponse.body.data.id, 'Expected the deleted class name ID to match the created class name ID.');
    });

    test('deleteClassName() - validation error', async () => {
        const deleteClassNameResponse = await sendDeleteRequest(`/class-name/${invalidIdUrl}`);
        assert.strictEqual(deleteClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteClassNameResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteClassName() - class name does not exist', async () => {
        const deleteClassNameResponse = await sendDeleteRequest(`/class-name/${nonExistentId}`);
        assert.strictEqual(deleteClassNameResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });
});