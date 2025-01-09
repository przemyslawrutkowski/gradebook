import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendDeleteRequest,
    sendGetRequest,
    sendPatchRequest,
} from '../../src/utils/requestHelpers';
import { survey1, questionType1, closedQuestion1, questionType2, closedQuestionResponse1, openQuestion1, emptyString, invalidIdUrl, nonExistentId, closedQuestion2, closedQuestionResponse2, openQuestion2, survey2 } from '../../src/utils/testData';

suite('surveysRouter', { only: true }, () => {
    afterEach(async () => {
        await prisma.questions_possible_responses.deleteMany();
        await prisma.questions.deleteMany();
        await prisma.questions_types.deleteMany();
        await prisma.surveys.deleteMany();
    });

    test('CreateSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createSurveyResponse = await sendPostRequest('/survey', {
            ...survey1,
            questions: [
                {
                    content: closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour, startMinute] = survey1.startTime.split(':').map(Number);
        const [endHour, endMinute] = survey1.endTime.split(':').map(Number);

        const startTime = new Date(survey1.startDate);
        startTime.setUTCHours(startHour, startMinute, 0, 0);
        const endTime = new Date(survey1.endDate);
        endTime.setUTCHours(endHour, endMinute, 0, 0);

        assert.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        assert.strictEqual(createSurveyResponse.body.data.start_time, startTime.toISOString(), `Expected the start time to be "${startTime.toISOString()}".`);
        assert.strictEqual(createSurveyResponse.body.data.end_time, endTime.toISOString(), `Expected the end time to be "${endTime.toISOString()}".`);
        assert.strictEqual(createSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        assert.strictEqual(createSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        assert.strictEqual(createSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, closedQuestionResponse1.content, `Expected the content to be "${closedQuestionResponse1.content}".`);
        assert.strictEqual(createSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });

    test('CreateSurvey() - validation error - questions is not an empty array', { only: true }, async () => {
        const createSurveyResponse = await sendPostRequest('/survey', {
            name: emptyString,
            description: emptyString,
            startDate: emptyString,
            endDate: emptyString,
            startTime: emptyString,
            endTime: emptyString,
            questions: [
                {
                    content: emptyString,
                    questionTypeId: emptyString,
                    responses: [
                        {
                            content: emptyString
                        }
                    ]
                },
                {
                    content: emptyString,
                    questionTypeId: emptyString
                }
            ]
        });
        assert.strictEqual(createSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createSurveyResponse.body.errors.length, 11, 'Expected the number of validation errors to be 11.');
    });

    test('CreateSurvey() - validation error - questions array does not exist', { only: true }, async () => {
        const createSurveyResponse = await sendPostRequest('/survey', {
            name: emptyString,
            description: emptyString,
            startDate: emptyString,
            endDate: emptyString,
            startTime: emptyString,
            endTime: emptyString,
        });

        assert.strictEqual(createSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createSurveyResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });

    test('getSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createSurveyResponse = await sendPostRequest('/survey', {
            ...survey1,
            questions: [
                {
                    content: closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour, startMinute] = survey1.startTime.split(':').map(Number);
        const [endHour, endMinute] = survey1.endTime.split(':').map(Number);

        const startTime = new Date(survey1.startDate);
        startTime.setUTCHours(startHour, startMinute, 0, 0);
        const endTime = new Date(survey1.endDate);
        endTime.setUTCHours(endHour, endMinute, 0, 0);

        assert.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');

        const getSurveyResponse = await sendGetRequest(`/survey/${createSurveyResponse.body.data.id}`);
        assert.strictEqual(getSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey retrieval.');
        assert.strictEqual(getSurveyResponse.body.data.start_time, startTime.toISOString(), `Expected the start time to be "${startTime.toISOString()}".`);
        assert.strictEqual(getSurveyResponse.body.data.end_time, endTime.toISOString(), `Expected the end time to be "${endTime.toISOString()}".`);
        assert.strictEqual(getSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        assert.strictEqual(getSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        assert.strictEqual(getSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, closedQuestionResponse1.content, `Expected the content to be "${closedQuestionResponse1.content}".`);
        assert.strictEqual(getSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });

    test('getSurvey() - validation error', { only: true }, async () => {
        const getSurveyResponse = await sendGetRequest(`/survey/${invalidIdUrl}`);
        assert.strictEqual(getSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getSurveyResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getSurvey() - survey does not exist', { only: true }, async () => {
        const getSurveyResponse = await sendGetRequest(`/survey/${nonExistentId}`);
        assert.strictEqual(getSurveyResponse.statusCode, 404, 'Expected the status code to be 404 for a event type that does not exist.');

    });

    test('getSurveys() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createSurveyResponse1 = await sendPostRequest('/survey', {
            ...survey1,
            questions: [
                {
                    content: closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour1, startMinute1] = survey1.startTime.split(':').map(Number);
        const [endHour1, endMinute1] = survey1.endTime.split(':').map(Number);

        const startTime1 = new Date(survey1.startDate);
        startTime1.setUTCHours(startHour1, startMinute1, 0, 0);
        const endTime1 = new Date(survey1.endDate);
        endTime1.setUTCHours(endHour1, endMinute1, 0, 0);

        assert.strictEqual(createSurveyResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');

        const createSurveyResponse2 = await sendPostRequest('/survey', {
            ...survey2,
            questions: [
                {
                    content: closedQuestion2.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse2.content
                        }
                    ]
                },
                {
                    content: openQuestion2.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour2, startMinute2] = survey2.startTime.split(':').map(Number);
        const [endHour2, endMinute2] = survey2.endTime.split(':').map(Number);

        const startTime2 = new Date(survey2.startDate);
        startTime2.setUTCHours(startHour2, startMinute2, 0, 0);
        const endTime2 = new Date(survey2.endDate);
        endTime2.setUTCHours(endHour2, endMinute2, 0, 0);

        assert.strictEqual(createSurveyResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');

        const getSurveysResponse = await sendGetRequest(`/survey`);
        assert.strictEqual(getSurveysResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey retrieval.');
        assert.strictEqual(getSurveysResponse.body.data[0].start_time, startTime1.toISOString(), `Expected the start time to be "${startTime1.toISOString()}".`);
        assert.strictEqual(getSurveysResponse.body.data[0].end_time, endTime1.toISOString(), `Expected the end time to be "${endTime1.toISOString()}".`);
        assert.strictEqual(getSurveysResponse.body.data[0].questions[0].survey_id, createSurveyResponse1.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        assert.strictEqual(getSurveysResponse.body.data[0].questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        assert.strictEqual(getSurveysResponse.body.data[0].questions[0].questions_possible_responses[0].content, closedQuestionResponse1.content, `Expected the content to be "${closedQuestionResponse1.content}".`);
        assert.strictEqual(getSurveysResponse.body.data[0].questions.length, 2, `Expected the number of surveys questions to be 2`);

        assert.strictEqual(getSurveysResponse.body.data[1].start_time, startTime2.toISOString(), `Expected the start time to be "${startTime2.toISOString()}".`);
        assert.strictEqual(getSurveysResponse.body.data[1].end_time, endTime2.toISOString(), `Expected the end time to be "${endTime2.toISOString()}".`);
        assert.strictEqual(getSurveysResponse.body.data[1].questions[0].survey_id, createSurveyResponse2.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        assert.strictEqual(getSurveysResponse.body.data[1].questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        assert.strictEqual(getSurveysResponse.body.data[1].questions[0].questions_possible_responses[0].content, closedQuestionResponse2.content, `Expected the content to be "${closedQuestionResponse2.content}".`);
        assert.strictEqual(getSurveysResponse.body.data[1].questions.length, 2, `Expected the number of surveys questions to be 2`);
    });

    test('updateSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createSurveyResponse = await sendPostRequest('/survey', {
            ...survey1,
            questions: [
                {
                    content: closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });

        assert.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');

        const updateSurveyResponse = await sendPatchRequest(
            `/survey/${createSurveyResponse.body.data.id}`,
            {
                ...survey2,
                questionsToAdd: [
                    {
                        content: closedQuestion2.content,
                        questionTypeId: createQuestionTypeResponse1.body.data.id,
                        responses: [
                            {
                                content: closedQuestionResponse2.content
                            }
                        ]
                    },
                    {
                        content: openQuestion2.content,
                        questionTypeId: createQuestionTypeResponse2.body.data.id
                    }
                ],
                questionsIdsToRemove: [
                    ...createSurveyResponse.body.data.questions.map((question: { id: string }) => question.id)
                ]
            }
        );
        const [startHour2, startMinute2] = survey2.startTime.split(':').map(Number);
        const [endHour2, endMinute2] = survey2.endTime.split(':').map(Number);

        const startTime2 = new Date(survey2.startDate);
        startTime2.setUTCHours(startHour2, startMinute2, 0, 0);
        const endTime2 = new Date(survey2.endDate);
        endTime2.setUTCHours(endHour2, endMinute2, 0, 0);

        assert.strictEqual(updateSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey update.');
        assert.strictEqual(updateSurveyResponse.body.data.start_time, startTime2.toISOString(), `Expected the start time to be "${startTime2.toISOString()}".`);
        assert.strictEqual(updateSurveyResponse.body.data.end_time, endTime2.toISOString(), `Expected the end time to be "${endTime2.toISOString()}".`);
        assert.strictEqual(updateSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        assert.strictEqual(updateSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        assert.strictEqual(updateSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, closedQuestionResponse2.content, `Expected the content to be "${closedQuestionResponse2.content}".`);
        assert.strictEqual(updateSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });

    test('updateSurvey() - validation error', { only: true }, async () => {
        const updateSurveyResponse = await sendPatchRequest(
            `/survey/${invalidIdUrl}`,
            {
                name: emptyString,
                description: emptyString,
                startDate: emptyString,
                endDate: emptyString,
                startTime: emptyString,
                endTime: emptyString,
                questionsToAdd: [
                    {
                        content: emptyString,
                        questionTypeId: emptyString,
                        responses: [
                            {
                                content: emptyString
                            }
                        ]
                    },
                    {
                        content: emptyString,
                        questionTypeId: emptyString
                    }
                ],
                questionsIdsToRemove: [emptyString]
            }
        );
        assert.strictEqual(updateSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateSurveyResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });

    test('updateSurvey() - survey does not exist', { only: true }, async () => {
        const createQuestionTypeResponse1 = await sendPostRequest('/question-type', questionType1);
        assert.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createQuestionTypeResponse2 = await sendPostRequest('/question-type', questionType2);
        assert.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');

        const createSurveyResponse = await sendPostRequest('/survey', {
            ...survey1,
            questions: [
                {
                    content: closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });

        assert.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');

        const updateSurveyResponse = await sendPatchRequest(
            `/survey/${nonExistentId}`,
            {
                ...survey2,
                questionsToAdd: [
                    {
                        content: closedQuestion2.content,
                        questionTypeId: createQuestionTypeResponse1.body.data.id,
                        responses: [
                            {
                                content: closedQuestionResponse2.content
                            }
                        ]
                    },
                    {
                        content: openQuestion2.content,
                        questionTypeId: createQuestionTypeResponse2.body.data.id
                    }
                ],
                questionsIdsToRemove: [
                    ...createSurveyResponse.body.data.questions.map((question: { id: string }) => question.id)
                ]
            }
        );

        assert.strictEqual(updateSurveyResponse.statusCode, 404, 'Expected the status code to be 404 for a survey that does not exist.');
    });
})