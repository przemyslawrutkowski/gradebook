import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { schoolYear1, schoolYear2, nonExistentId, invalidIdUrl, emptyString, } from '../../src/utils/testData';

suite('schoolYearsRouter', () => {
    afterEach(async () => {
        await prisma.school_years.deleteMany();
    });

    test('createSchoolYear() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        assert.strictEqual(createSchoolYearResponse.body.data.name, schoolYear1.name, `Expected the name to be "${schoolYear1.name}".`);
        assert.strictEqual(createSchoolYearResponse.body.data.start_date, new Date(schoolYear1.startDate).toISOString(), `Expected the startDate to be "${schoolYear1.startDate}".`);
        assert.strictEqual(createSchoolYearResponse.body.data.end_date, new Date(schoolYear1.endDate).toISOString(), `Expected the endDate to be "${schoolYear1.endDate}".`);
    });

    test('createSchoolYear() - validation error', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', {
            name: emptyString,
            startDate: emptyString,
            endDate: emptyString
        });
        assert.strictEqual(createSchoolYearResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createSchoolYearResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });

    test('createSchoolYear() - school year already exists', async () => {
        const createSchoolYearResponse1 = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSchoolYearResponse2 = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse2.statusCode, 409, 'Expected the status code to be 409 for a school year that already exists.');
    });

    test('createSchoolYear() - start date is before end date', async () => {
        const createSchoolYearResponse1 = await sendPostRequest('/school-year', {
            name: '2024/2025',
            startDate: '2025-06-30',
            endDate: '2024-10-01'
        });
        assert.strictEqual(createSchoolYearResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });

    test('getSchoolYear() - success', async () => {
        const createSchoolYearResponse1 = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSchoolYearResponse2 = await sendPostRequest('/school-year', schoolYear2);
        assert.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const getSchoolYearsResponse = await sendGetRequest('/school-year');
        assert.strictEqual(getSchoolYearsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school years retrieval.');
        assert.strictEqual(getSchoolYearsResponse.body.data.length, 2, 'Expected the number of retrieved school years to be 2.');
    });

    test('updateSchoolYear() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const updateClassResponse = await sendPatchRequest(
            `/school-year/${createSchoolYearResponse.body.data.id}`,
            {
                name: schoolYear1.name,
                startDate: schoolYear1.startDate,
                endDate: schoolYear1.endDate
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year update.');
        assert.strictEqual(updateClassResponse.body.data.id, createSchoolYearResponse.body.data.id, 'Expected the updated school year ID to match the created school year ID.');
        assert.strictEqual(updateClassResponse.body.data.name, schoolYear1.name, `Expected the updated school year name to be "${schoolYear1.name}".`);
        assert.strictEqual(updateClassResponse.body.data.start_date, new Date(schoolYear1.startDate).toISOString(), `Expected the updated start date to be "${schoolYear1.startDate}".`);
        assert.strictEqual(updateClassResponse.body.data.end_date, new Date(schoolYear1.endDate).toISOString(), `Expected the updated end date to be "${schoolYear1.endDate}".`);
    });

    test('updateSchoolYear() - validation error', async () => {
        const updateSchoolYearResponse = await sendPatchRequest(`/school-year/${invalidIdUrl}`, {
            name: emptyString,
            startDate: emptyString,
            endDate: emptyString
        });
        assert.strictEqual(updateSchoolYearResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateSchoolYearResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateSchoolYear() - school year does not exist', async () => {
        const updateSchoolYearResponse = await sendPatchRequest(`/school-year/${nonExistentId}`, {
            name: schoolYear1.name,
            startDate: schoolYear1.startDate,
            endDate: schoolYear1.endDate,
        });
        assert.strictEqual(updateSchoolYearResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });

    test('deleteSchoolYear() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const deleteSchoolYearResponse = await sendDeleteRequest(`/school-year/${createSchoolYearResponse.body.data.id}`);
        assert.strictEqual(deleteSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year deletion.');
        assert.strictEqual(deleteSchoolYearResponse.body.data.id, createSchoolYearResponse.body.data.id, 'Expected the deleted school year ID to match the created school year ID.');
    });

    test('deleteSchoolYear() - validation error', async () => {
        const deleteClassResponse = await sendDeleteRequest(`/class/${invalidIdUrl}`);
        assert.strictEqual(deleteClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteClassResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteSchoolYear() - school year does not exist', async () => {
        const deleteSchoolYearResponse = await sendDeleteRequest(`/school-year/${nonExistentId}`);
        assert.strictEqual(deleteSchoolYearResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
});