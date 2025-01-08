import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, problemType1 } from '../../src/utils/testData';

suite('problemTypesRouter', () => {
    afterEach(async () => {
        await prisma.problem_types.deleteMany();
    });

    test('createProblemType() - success', async () => {
        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        assert.strictEqual(createProblemTypeResponse.body.data.name, problemType1.name, `Expected the problem type name to be "${problemType1.name}".`);
    });

    test('createProblemType() - validation error', async () => {
        const createProblemTypeResponse = await sendPostRequest('/problem-type', {
            name: emptyString
        });
        assert.strictEqual(createProblemTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createProblemTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createProblemType() - problem type already exists', async () => {
        const createProblemTypeResponse1 = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createProblemTypeResponse2 = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a problem type that already exists.');
    });

    test('deleteProblemType() - success', async () => {
        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const deleteProblemTypeResponse = await sendDeleteRequest(`/problem-type/${createProblemTypeResponse.body.data.id}`);
        assert.strictEqual(deleteProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type deletion.');
        assert.strictEqual(deleteProblemTypeResponse.body.data.id, createProblemTypeResponse.body.data.id, 'Expected the deleted problem type ID to match the created problem type ID.');
    });

    test('deleteProblemType() - validation error', async () => {
        const deleteProblemTypeResponse = await sendDeleteRequest(`/problem-type/${invalidIdUrl}`);
        assert.strictEqual(deleteProblemTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteProblemTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteProblemType() - status does not exist', async () => {
        const deleteProblemTypeResponse = await sendDeleteRequest(`/problem-type/${nonExistentId}`);
        assert.strictEqual(deleteProblemTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });
});