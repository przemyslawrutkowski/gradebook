import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
    sendGetRequest,
} from '../../src/utils/requestHelpers';
import { userType1, nonExistentId, invalidIdUrl, emptyString, userType2 } from '../../src/utils/testData';

suite('userTypesRouter', () => {
    afterEach(async () => {
        await prisma.user_types.deleteMany();
    });

    test('createUserType() - success', async () => {
        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        assert.strictEqual(createUserTypeResponse.body.data.name, userType1.name, `Expected the user type name to be "${userType1.name}".`);
    });

    test('createUserType() - validation error', async () => {
        const createUserTypeResponse = await sendPostRequest('/user-type', {
            name: emptyString
        });
        assert.strictEqual(createUserTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createUserTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createUserType() - user type already exists', async () => {
        const createUserTypeResponse1 = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');

        const createUserTypeResponse2 = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a user type that already exists.');
    });

    test('getUserTypes() - success', async () => {
        const createUserTypeResponse1 = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');

        const createUserTypeResponse2 = await sendPostRequest('/user-type', userType2);
        assert.strictEqual(createUserTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');

        const getUserTypesResponse = await sendGetRequest('/user-type');
        assert.strictEqual(getUserTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user-types retrieval.');
        assert.strictEqual(getUserTypesResponse.body.data.length, 2, 'Expected the number of retrieved user-types to be 2.');
    });

    test('deleteUserType() - success', async () => {
        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const deleteUserTypeResponse = await sendDeleteRequest(`/user-type/${createUserTypeResponse.body.data.id}`);
        assert.strictEqual(deleteUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type deletion.');
        assert.strictEqual(deleteUserTypeResponse.body.data.id, createUserTypeResponse.body.data.id, 'Expected the deleted user type ID to match the created user type ID.');
    });

    test('deleteUserType() - validation error', async () => {
        const deleteUserTypeResponse = await sendDeleteRequest(`/user-type/${invalidIdUrl}`);
        assert.strictEqual(deleteUserTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteUserTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteUserType() - user type does not exist', async () => {
        const deleteUserTypeResponse = await sendDeleteRequest(`/user-type/${nonExistentId}`);
        assert.strictEqual(deleteUserTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a user type that does not exist.');
    });
});