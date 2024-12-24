import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { eventType1, eventType2, schoolEvent1, schoolEvent2, nonExistentId, invalidIdUrl, emptyString } from '../../src/utils/testData';

suite('schoolEventsRouter', () => {
    afterEach(async () => {
        await prisma.school_events.deleteMany();
        await prisma.event_types.deleteMany();
    });

    test('createSchoolEvent() - success', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            ...eventType1,
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });

        assert.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        assert.strictEqual(createSchoolEventResponse.body.data.name, schoolEvent1.name, `Expected the name to be "${schoolEvent1.name}".`);
        assert.strictEqual(createSchoolEventResponse.body.data.location, schoolEvent1.location, `Expected the location to be "${schoolEvent1.location}".`);
        assert.strictEqual(createSchoolEventResponse.body.data.description, schoolEvent1.description, `Expected the description to be "${schoolEvent1.description}"`);
        assert.strictEqual(createSchoolEventResponse.body.data.date, new Date(schoolEvent1.date).toISOString(), `Expected the date to be ${new Date(schoolEvent1.date).toISOString()}.`);
    });


    test('createSchoolEvent() - validation error', async () => {
        const createGradeResponse = await sendPostRequest('/school-event', {
            name: emptyString,
            location: emptyString,
            description: emptyString,
            date: emptyString,
            startTime: emptyString,
            endTime: emptyString,
            eventTypeId: emptyString
        });
        assert.strictEqual(createGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createGradeResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });

    test('createSchoolEvent() - event type does not exist', async () => {
        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: nonExistentId
        });
        assert.strictEqual(createSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });

    test('getSchoolEvents() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createEventTypeResponse2 = await sendPostRequest('/event-type', {
            ...eventType2
        });
        assert.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse1 = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse1.body.data.id
        });
        assert.strictEqual(createSchoolEventResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const createSchoolEventResponse2 = await sendPostRequest('/school-event', {
            ...schoolEvent2,
            eventTypeId: createEventTypeResponse2.body.data.id
        });
        assert.strictEqual(createSchoolEventResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const getSchoolEventsResponse = await sendGetRequest('/school-event');
        assert.strictEqual(getSchoolEventsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school events retrieval.');
        assert.strictEqual(getSchoolEventsResponse.body.data.length, 2, 'Expected the number of retrieved school events to be 2.');
    });

    test('getSchoolEvent() - success', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const getSchoolEventResponse = await sendGetRequest(`/school-event/${createSchoolEventResponse.body.data.id}`);
        assert.strictEqual(getSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event retrieval.');
        assert.strictEqual(createSchoolEventResponse.body.data.name, schoolEvent1.name, `Expected the name to be "${schoolEvent1.name}".`);
        assert.strictEqual(createSchoolEventResponse.body.data.location, schoolEvent1.location, `Expected the location to be "${schoolEvent1.location}".`);
        assert.strictEqual(createSchoolEventResponse.body.data.description, schoolEvent1.description, `Expected the description to be "${schoolEvent1.description}"`);
        assert.strictEqual(createSchoolEventResponse.body.data.date, new Date(schoolEvent1.date).toISOString(), `Expected the date to be ${new Date(schoolEvent1.date).toISOString()}.`);
    });

    test('getSchoolEvent() - validation error', async () => {
        const getSchoolEventResponse = await sendGetRequest(`/school-event/${invalidIdUrl}`);
        assert.strictEqual(getSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getSchoolEventResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getSchoolEvent() - school event does not exist', async () => {
        const getSchoolEventResponse = await sendGetRequest(`/school-event/${nonExistentId}`);
        assert.strictEqual(getSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });

    test('updateSchoolEvent() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1,
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createEventTypeResponse2 = await sendPostRequest('/event-type', {
            ...eventType2,
        });
        assert.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse1.body.data.id
        });
        assert.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const updateSchoolEventResponse = await sendPatchRequest(
            `/school-event/${createSchoolEventResponse.body.data.id}`,
            {
                ...schoolEvent2,
                eventTypeId: createEventTypeResponse2.body.data.id
            }
        );

        assert.strictEqual(updateSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event update.');
        assert.strictEqual(updateSchoolEventResponse.body.data.name, schoolEvent2.name, `Expected the name to be "${schoolEvent2.name}".`);
        assert.strictEqual(updateSchoolEventResponse.body.data.location, schoolEvent2.location, `Expected the location to be "${schoolEvent2.location}".`);
        assert.strictEqual(updateSchoolEventResponse.body.data.description, schoolEvent2.description, `Expected the description to be "${schoolEvent2.description}"`);
        assert.strictEqual(updateSchoolEventResponse.body.data.date, new Date(schoolEvent2.date).toISOString(), `Expected the date to be ${new Date(schoolEvent2.date).toISOString()}.`);
        assert.strictEqual(updateSchoolEventResponse.body.data.event_type_id, createEventTypeResponse2.body.data.id, `Expected the event type ID to be "${createEventTypeResponse2.body.data.id}".`);

    });

    test('updateSchoolEvent() - validation error', async () => {
        const updateSchoolEventResponse = await sendPatchRequest(`/school-event/${invalidIdUrl}`, {
            name: emptyString,
            location: emptyString,
            description: emptyString,
            date: emptyString,
            startTime: emptyString,
            endTime: emptyString,
            eventTypeId: emptyString
        });
        assert.strictEqual(updateSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateSchoolEventResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateSchoolEvent() - school event does not exist', async () => {
        const updateSchoolEventResponse = await sendPatchRequest(
            `/school-event/${nonExistentId}`,
            {
                ...schoolEvent2,
            }
        );
        assert.strictEqual(updateSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });

    test('updateSchoolEvent() - event type does not exist', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            ...eventType1,
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        assert.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const updateSchoolEventResponse = await sendPatchRequest(
            `/school-event/${createSchoolEventResponse.body.data.id}`,
            {
                ...schoolEvent2,
                eventTypeId: nonExistentId
            }
        );
        assert.strictEqual(updateSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });

    test('deleteSchoolEvent() - success', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            ...eventType1,
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createSchoolEventResponse = await sendPostRequest('/school-event', {
            ...schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        assert.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');

        const deleteSchoolEventResponse = await sendDeleteRequest(`/school-event/${createSchoolEventResponse.body.data.id}`);
        assert.strictEqual(deleteSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event deletion.');
        assert.strictEqual(deleteSchoolEventResponse.body.data.id, createSchoolEventResponse.body.data.id, 'Expected the deleted school event ID to match the created school event ID.');
    });

    test('deleteSchoolEvent() - validation error', async () => {
        const deleteSchoolEventResponse = await sendDeleteRequest(`/school-event/${invalidIdUrl}`);
        assert.strictEqual(deleteSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteSchoolEventResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteSchoolEvent() - school event does not exist', async () => {
        const deleteSchoolEventResponse = await sendDeleteRequest(`/school-event/${nonExistentId}`);
        assert.strictEqual(deleteSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });
});