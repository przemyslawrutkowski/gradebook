import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { schoolYear1, semester1, semester2, nonExistentId, invalidIdUrl, emptyString, semester4 } from '../../src/utils/testData';

suite('semestersRouter', () => {
    afterEach(async () => {
        await prisma.semesters.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createSemester() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        assert.strictEqual(createSemesterResponse.body.data.semester, semester1.semester, `Expected the semester to be "${semester1.semester}".`);
        assert.strictEqual(createSemesterResponse.body.data.start_date, new Date(semester1.startDate).toISOString(), `Expected the startDate to be "${semester1.startDate}".`);
        assert.strictEqual(createSemesterResponse.body.data.end_date, new Date(semester1.endDate).toISOString(), `Expected the endDate to be "${semester1.endDate}".`);
        assert.strictEqual(createSemesterResponse.body.data.school_year_id, createSchoolYearResponse.body.data.id, `Expected the schoolYearId to be "${createSchoolYearResponse.body.data.id}".`);
    });

    test('createSemester() - validation error', async () => {
        const createSemesterResponse = await sendPostRequest('/semester', {
            semester: emptyString,
            startDate: emptyString,
            endDate: emptyString,
            schoolYearId: emptyString
        });
        assert.strictEqual(createSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createSemesterResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });

    test('createSemester() - semester already exists', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse1 = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createSemesterResponse2 = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse2.statusCode, 409, 'Expected the status code to be 409 for a semester that already exists.');
    });

    test('createSemester() - school year does not exist', async () => {
        const createSemesterResponse1 = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: nonExistentId
        });
        assert.strictEqual(createSemesterResponse1.statusCode, 404, 'Expected the status code to be 409 for a semester that does not exist.');
    });

    test('createSemester() - start date is before end date', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse1 = await sendPostRequest('/semester', {
            ...{
                semester: 1,
                startDate: '2025-02-10',
                endDate: '2024-10-01'
            },
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });

    test('createSemester() - semester dates are not within the school year dates', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse1 = await sendPostRequest('/semester', {
            ...semester4,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse1.statusCode, 400, 'Expected the status code to be 400 for a semester dates that are not within the school year dates.');
    });

    test('getSemesters() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse1 = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createSemesterResponse2 = await sendPostRequest('/semester', {
            ...semester2,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const getSemestersResponse = await sendGetRequest(`/semester/${createSchoolYearResponse.body.data.id}`);
        assert.strictEqual(getSemestersResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semesters retrieval.');
        assert.strictEqual(getSemestersResponse.body.data.length, 2, 'Expected the number of retrieved semesters to be 2.');

    });

    test('getSemesters() - validation error', async () => {
        const getSemestersResponse = await sendGetRequest(`/semester/${invalidIdUrl}`);
        assert.strictEqual(getSemestersResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getSemestersResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getSemesters() - school year does not exist', async () => {
        const getSemestersResponse = await sendGetRequest(`/semester/${nonExistentId}`);
        assert.strictEqual(getSemestersResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });

    test('updateSemester() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const updateSemesterResponse = await sendPatchRequest(
            `/semester/${createSemesterResponse.body.data.id}`,
            {
                semester: semester2.semester,
                startDate: semester2.startDate,
                endDate: semester2.endDate
            }
        );
        assert.strictEqual(updateSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester update.');
        assert.strictEqual(updateSemesterResponse.body.data.semester, semester2.semester, `Expected the updated semester number to be "${semester2.semester}".`);
        assert.strictEqual(updateSemesterResponse.body.data.start_date, new Date(semester2.startDate).toISOString(), `Expected the updated startDate to be "${semester2.startDate}".`);
        assert.strictEqual(updateSemesterResponse.body.data.end_date, new Date(semester2.endDate).toISOString(), `Expected the updated endDate to be "${semester2.endDate}".`);
    });

    test('updateSemester() - validation error', async () => {
        const updateSemesterResponse = await sendPatchRequest(`/semester/${invalidIdUrl}`, {
            semester: emptyString,
            startDate: emptyString,
            endDate: emptyString
        });
        assert.strictEqual(updateSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateSemesterResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateSemester() - semester does not exist', async () => {
        const updateSemesterResponse = await sendPatchRequest(`/semester/${nonExistentId}`,
            {
                semester: semester2.semester,
                startDate: semester2.startDate,
                endDate: semester2.endDate
            }
        );
        assert.strictEqual(updateSemesterResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });

    test('deleteSemester() - success', async () => {
        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const deleteSemesterResponse = await sendDeleteRequest(`/semester/${createSemesterResponse.body.data.id}`);
        assert.strictEqual(deleteSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester deletion.');
        assert.strictEqual(deleteSemesterResponse.body.data.id, createSemesterResponse.body.data.id, 'Expected the deleted semester ID to match the created semester ID.');
    });

    test('deleteSemester() - validation error', async () => {
        const deleteSemesterResponse = await sendDeleteRequest(`/semester/${invalidIdUrl}`);
        assert.strictEqual(deleteSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteSemesterResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteSemester() - semester does not exist', async () => {
        const deleteSemesterResponse = await sendDeleteRequest(`/semester/${nonExistentId}`);
        assert.strictEqual(deleteSemesterResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });
});