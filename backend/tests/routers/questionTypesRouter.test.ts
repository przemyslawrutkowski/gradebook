import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
    sendGetRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, status1, status2, questionType1, questionType2 } from '../../src/utils/testData';

suite('questionTypesRouter', () => {
    afterEach(async () => {
        await prisma.questions_types.deleteMany();
    });

    test('createQuestionType() - success', async () => {
        const createQuestionTypeResponse = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        assert.strictEqual(createQuestionTypeResponse.body.data.name, questionType1.name, `Expected the status name to be "${questionType1.name}".`);
    });

    test('createQuestionType() - validation error', async () => {
        const createQuestionTypeResponse = await sendPostRequest('/question-type', {
            name: emptyString
        });
        assert.strictEqual(createQuestionTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createQuestionTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createQuestionType() - question type already exists', async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a question type that already exists.');
    });

    test('getQuestionTypes() - success', async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const getQuestionTypesResponse = await sendGetRequest('/question-type');
        assert.strictEqual(getQuestionTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question types retrieval.');
        assert.strictEqual(getQuestionTypesResponse.body.data.length, 2, 'Expected the number of retrieved question types to be 2.');
    });

    test('deleteQuestionType() - success', async () => {
        const createQuestionTypeResponse = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const deleteQuestionTypeResponse = await sendDeleteRequest(`/question-type/${createQuestionTypeResponse.body.data.id}`);
        assert.strictEqual(deleteQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type deletion.');
        assert.strictEqual(deleteQuestionTypeResponse.body.data.id, createQuestionTypeResponse.body.data.id, 'Expected the deleted question type ID to match the created question type ID.');
    });

    test('deleteQuestionType() - validation error', async () => {
        const deleteQuestionTypeResponse = await sendDeleteRequest(`/question-type/${invalidIdUrl}`);
        assert.strictEqual(deleteQuestionTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteQuestionTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteQuestionType() - question type does not exist', async () => {
        const deleteQuestionTypeResponse = await sendDeleteRequest(`/question-type/${nonExistentId}`);
        assert.strictEqual(deleteQuestionTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a question type that does not exist.');
    });
});