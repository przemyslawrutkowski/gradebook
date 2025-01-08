import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, problemType1, userType1, problem1, status2, problemType2, problem2, student1 } from '../../src/utils/testData';

suite('problemsRouter', () => {
    afterEach(async () => {
        await prisma.problems_gradebook.deleteMany();
        await prisma.students.deleteMany();
        await prisma.statuses.deleteMany();
        await prisma.problem_types.deleteMany();
        await prisma.user_types.deleteMany();
    });

    test('createProblem() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        assert.strictEqual(createProblemResponse.body.data.description, problem1.description, `Expected the problem description to be "${problem1.description}".`);
        assert.strictEqual(createProblemResponse.body.data.problem_type_id, createProblemTypeResponse.body.data.id, `Expected the problem type ID to match the created problem type ID.`);
        assert.strictEqual(createProblemResponse.body.data.reporter_id, signUpResponse.body.data, `Expected the user ID to match the created user ID.`);
        assert.strictEqual(createProblemResponse.body.data.user_type_id, createUserTypeResponse.body.data.id, 'Expected the user type ID to match the created user type ID.');
        assert.strictEqual(createProblemResponse.body.data.status_id, createStatusResponse.body.data.id, 'Expected the status ID to match the created status ID.');
    });


    test('createProblem() - validation error', async () => {
        const createProblemResponse = await sendPostRequest('/problem', {
            description: emptyString,
            problemTypeId: emptyString,
            reporterId: emptyString,
            userTypeId: emptyString
        });
        assert.strictEqual(createProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createProblemResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });

    test('createProblem() - problem type does not exist', async () => {
        const createProblemResponse = await sendPostRequest('/problem', {
            description: problem1.description,
            problemTypeId: nonExistentId,
            reporterId: nonExistentId,
            userTypeId: nonExistentId
        });
        assert.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });

    test('createProblem() - user type does not exist', async () => {
        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            description: problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: nonExistentId,
            userTypeId: nonExistentId
        });
        assert.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a user type that does not exist.');
    });

    test('createProblem() - status does not exist', async () => {
        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            description: problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: nonExistentId,
            userTypeId: createUserTypeResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });

    test('createProblem() - user does not exist', async () => {
        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            description: problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: nonExistentId,
            userTypeId: createUserTypeResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('getProblems() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse1 = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createProblemTypeResponse2 = await sendPostRequest('/problem-type', problemType2);
        assert.strictEqual(createProblemTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse1 = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse1.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        assert.strictEqual(createProblemResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const createProblemResponse2 = await sendPostRequest('/problem', {
            ...problem2,
            problemTypeId: createProblemTypeResponse2.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        assert.strictEqual(createProblemResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const getProblemsResponse = await sendGetRequest(`/problem`);
        assert.strictEqual(getProblemsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problems retrieval.');
        assert.strictEqual(getProblemsResponse.body.data.length, 2, 'Expected the number of retrieved problems to be 2.');
    });

    test('getProblemsByType() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse1 = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createProblemTypeResponse2 = await sendPostRequest('/problem-type', problemType2);
        assert.strictEqual(createProblemTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse1 = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse1.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        assert.strictEqual(createProblemResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const createProblemResponse2 = await sendPostRequest('/problem', {
            ...problem2,
            problemTypeId: createProblemTypeResponse2.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        assert.strictEqual(createProblemResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const getProblemsResponse = await sendGetRequest(`/problem/${createProblemTypeResponse1.body.data.id}`);
        assert.strictEqual(getProblemsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problems retrieval.');
        assert.strictEqual(getProblemsResponse.body.data.length, 1, 'Expected the number of retrieved problems to be 1.');
    });

    test('getProblemsByType() - validation error', async () => {
        const getProblemsResponse = await sendGetRequest(`/problem/${invalidIdUrl}`);
        assert.strictEqual(getProblemsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getProblemsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getProblemsByType() - problem type does not exist', async () => {
        const getProblemsResponse = await sendGetRequest(`/problem/${nonExistentId}`);
        assert.strictEqual(getProblemsResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });

    test('updateProblem() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
            statusId: createStatusResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const updateProblemResponse = await sendPatchRequest(
            `/problem/${createProblemResponse.body.data.id}`,
            {
                statusId: createStatusResponse.body.data.id
            }
        );
        assert.strictEqual(updateProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem update.');
        assert.strictEqual(updateProblemResponse.body.data.status_id, createStatusResponse.body.data.id, `Expected the updated status ID to match the created status ID.`);
    });

    test('updateProblem() - validation error', async () => {
        const updateProblemResponse = await sendPatchRequest(`/problem/${invalidIdUrl}`, {
            statusId: emptyString
        });
        assert.strictEqual(updateProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateProblemResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateProblem() - problem does not exist', async () => {
        const updateExamResponse = await sendPatchRequest(
            `/problem/${nonExistentId}`,
            {
                statusId: nonExistentId
            }
        );
        assert.strictEqual(updateExamResponse.statusCode, 404, 'Expected the status code to be 404 for a problem that does not exist.');
    });

    test('updateProblem() - status does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
            statusId: createStatusResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const updateProblemResponse = await sendPatchRequest(
            `/problem/${createProblemResponse.body.data.id}`,
            {
                statusId: nonExistentId
            }
        );
        assert.strictEqual(updateProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });

    test('deleteProblem() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createStatusResponse = await sendPostRequest('/status', status2);
        assert.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');

        const createProblemTypeResponse = await sendPostRequest('/problem-type', problemType1);
        assert.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');

        const createUserTypeResponse = await sendPostRequest('/user-type', userType1);
        assert.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');

        const createProblemResponse = await sendPostRequest('/problem', {
            ...problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id
        });
        assert.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');

        const deleteProblemResponse = await sendDeleteRequest(`/problem/${createProblemResponse.body.data.id}`);
        assert.strictEqual(deleteProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem deletion.');
        assert.strictEqual(deleteProblemResponse.body.data.id, createProblemResponse.body.data.id, 'Expected the deleted problem ID to match the created problem ID.');
    });

    test('deleteProblem() - validation error', async () => {
        const deleteProblemResponse = await sendDeleteRequest(`/problem/${invalidIdUrl}`);
        assert.strictEqual(deleteProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteProblemResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteProblem() - problem does not exist', async () => {
        const deleteProblemResponse = await sendDeleteRequest(`/problem/${nonExistentId}`);
        assert.strictEqual(deleteProblemResponse.statusCode, 404, 'Expected the status code to be 404 for an problem that does not exist.');
    });
});