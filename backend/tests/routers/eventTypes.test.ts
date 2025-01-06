import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { nonExistentId, invalidIdUrl, emptyString, eventType1, eventType2 } from '../../src/utils/testData';

suite('eventTypesRouter', () => {
    afterEach(async () => {
        await prisma.event_types.deleteMany();
    });

    test('createEventType() - success', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            ...eventType1,
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        assert.strictEqual(createEventTypeResponse.body.data.name, eventType1.name, `Expected the event type name to be "${eventType1.name}".`);
    });


    test('createEventType() - validation error', async () => {
        const createEventTypeResponse = await sendPostRequest('/event-type', {
            name: emptyString,
        });
        assert.strictEqual(createEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('createEventType() - event type already exists', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createEventTypeResponse2 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse2.statusCode, 409, 'Expected the status code to be 404 for a event type that already exists.');
    });

    test('getEventTypes() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createEventTypeResponse2 = await sendPostRequest('/event-type', {
            ...eventType2
        });
        assert.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const getEventTypesResponse = await sendGetRequest(`/event-type`);
        assert.strictEqual(getEventTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event types retrieval.');
        assert.strictEqual(getEventTypesResponse.body.data.length, 2, 'Expected the number of retrieved event types to be 2.');
    });

    test('getEventType() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const createEventTypeResponse2 = await sendPostRequest('/event-type', {
            ...eventType2
        });
        assert.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const getEventTypeResponse = await sendGetRequest(`/event-type/${createEventTypeResponse1.body.data.id}`);
        assert.strictEqual(getEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type retrieval.');
        assert.strictEqual(getEventTypeResponse.body.data.name, eventType1.name, `Expected the event type name to be "${eventType1.name}".`);
    });

    test('getEventType() - validation error', async () => {
        const getEventTypeResponse = await sendGetRequest(`/event-type/${invalidIdUrl}`);
        assert.strictEqual(getEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getEventType() - event type does not exist', async () => {
        const getGradesResponse = await sendGetRequest(`/event-type/${nonExistentId}`);
        assert.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a event type that does not exist.');
    });

    test('updateEventType() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const updateEventTypeResponse = await sendPatchRequest(
            `/event-type/${createEventTypeResponse1.body.data.id}`,
            {
                name: eventType2.name
            }
        );
        assert.strictEqual(updateEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type update.');
        assert.strictEqual(updateEventTypeResponse.body.data.name, eventType2.name, `Expected the updated event type name to be "${eventType2.name}".`);
    });

    test('updateEventType() - validation error', async () => {
        const updateEventTypeResponse = await sendPatchRequest(`/event-type/${invalidIdUrl}`, {
            name: emptyString
        });
        assert.strictEqual(updateEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateEventTypeResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateEventType() - event type does not exist', async () => {
        const updateEventTypeResponse = await sendPatchRequest(
            `/event-type/${nonExistentId}`,
            {
                name: eventType2.name
            }
        );
        assert.strictEqual(updateEventTypeResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });

    test('deleteEventType() - success', async () => {
        const createEventTypeResponse1 = await sendPostRequest('/event-type', {
            ...eventType1
        });
        assert.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');

        const deleteEventTypeResponse = await sendDeleteRequest(`/event-type/${createEventTypeResponse1.body.data.id}`);
        assert.strictEqual(deleteEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type deletion.');
        assert.strictEqual(deleteEventTypeResponse.body.data.id, createEventTypeResponse1.body.data.id, 'Expected the deleted event type ID to match the created event type ID.');
    });

    test('deleteEventType() - validation error', async () => {
        const deleteEventTypeResponse = await sendDeleteRequest(`/event-type/${invalidIdUrl}`);
        assert.strictEqual(deleteEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteEventType() - event type does not exist', async () => {
        const deleteEventTypeResponse = await sendDeleteRequest(`/event-type/${nonExistentId}`);
        assert.strictEqual(deleteEventTypeResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });
});