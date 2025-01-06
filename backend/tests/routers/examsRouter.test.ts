import prisma from '../../src/db';
import test, { afterEach, beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { teacher1, subject1, nonExistentId, invalidIdUrl, emptyString, lessonsData1, exam1, semester1, lessonsData4, exam3, exam2, exam4, className1, schoolYear1 } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('examsRouter', () => {
    afterEach(async () => {
        await prisma.exams.deleteMany();
        await prisma.lessons.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.semesters.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createExam() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');


        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createExamResponse = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson.id
        });
        assert.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        assert.strictEqual(createExamResponse.body.data.topic, exam1.topic, `Expected the topic to be "${exam1.topic}".`);
        assert.strictEqual(createExamResponse.body.data.scope, exam1.scope, `Expected the scope to be "${exam1.scope}".`);
        assert.strictEqual(createExamResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });


    test('createExam() - validation error', async () => {
        const createExamResponse = await sendPostRequest('/exam', {
            topic: emptyString,
            scope: emptyString,
            lessonId: emptyString
        });
        assert.strictEqual(createExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createExamResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });

    test('createExam() - lesson does not exist', async () => {
        const createExamResponse = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: nonExistentId
        });
        assert.strictEqual(createExamResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('getExams() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createExamResponse1 = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson.id
        });
        assert.strictEqual(createExamResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const createExamResponse2 = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson.id
        });
        assert.strictEqual(createExamResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const getExamsResponse = await sendGetRequest(`/exam/${signUpResponse.body.data}`);
        assert.strictEqual(getExamsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exams retrieval.');
        assert.strictEqual(getExamsResponse.body.data.length, 2, 'Expected the number of retrieved exams to be 2.');
    });

    test('getExams() - validation error', async () => {
        const getExamsResponse = await sendGetRequest(`/exam/${invalidIdUrl}`);
        assert.strictEqual(getExamsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getExamsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getExams() - user does not exist', async () => {
        const getExamsResponse = await sendGetRequest(`/exam/${nonExistentId}`);
        assert.strictEqual(getExamsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('getThreeUpcomingExams() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData4,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson1 = getLessonsResponse.body.data[1] as lessons;
        const lesson2 = getLessonsResponse.body.data[2] as lessons;
        const lesson3 = getLessonsResponse.body.data[4] as lessons;
        const lesson4 = getLessonsResponse.body.data[5] as lessons;

        const createExamResponse1 = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson1.id
        });
        assert.strictEqual(createExamResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const createExamResponse2 = await sendPostRequest('/exam', {
            ...exam2,
            lessonId: lesson2.id
        });
        assert.strictEqual(createExamResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const createExamResponse3 = await sendPostRequest('/exam', {
            ...exam3,
            lessonId: lesson3.id
        });
        assert.strictEqual(createExamResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const createExamResponse4 = await sendPostRequest('/exam', {
            ...exam4,
            lessonId: lesson4.id
        });
        assert.strictEqual(createExamResponse4.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const getExamsResponse = await sendGetRequest(`/exam/upcoming/${signUpResponse.body.data}`);

        assert.strictEqual(getExamsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exams retrieval.');
        assert.strictEqual(getExamsResponse.body.data.length, 3, 'Expected the number of retrieved exams to be 3.');
        assert.strictEqual(getExamsResponse.body.data[0].id, createExamResponse1.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
        assert.strictEqual(getExamsResponse.body.data[1].id, createExamResponse3.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
        assert.strictEqual(getExamsResponse.body.data[2].id, createExamResponse2.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
    });

    test('getThreeUpcomingExams() - validation error', async () => {
        const getExamsResponse = await sendGetRequest(`/exam/upcoming/${invalidIdUrl}`);
        assert.strictEqual(getExamsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getExamsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getThreeUpcomingExams() - user does not exist', async () => {
        const getExamsResponse = await sendGetRequest(`/exam/upcoming/${nonExistentId}`);
        assert.strictEqual(getExamsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('updateGrade() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');


        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createExamResponse = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson.id
        });
        assert.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const updateExamResponse = await sendPatchRequest(
            `/exam/${createExamResponse.body.data.id}`,
            {
                topic: exam2.topic,
                scope: exam2.scope
            }
        );
        assert.strictEqual(updateExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam update.');
        assert.strictEqual(updateExamResponse.body.data.topic, exam2.topic, `Expected the updated topic to be "${exam2.topic}".`);
        assert.strictEqual(updateExamResponse.body.data.scope, exam2.scope, `Expected the updated scope to be "${exam2.scope}".`);
    });

    test('updateExam() - validation error', async () => {
        const updateExamResponse = await sendPatchRequest(`/exam/${invalidIdUrl}`, {
            topic: emptyString,
            scope: emptyString
        });
        assert.strictEqual(updateExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateExamResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateExam() - exam does not exist', async () => {
        const updateExamResponse = await sendPatchRequest(
            `/exam/${nonExistentId}`,
            {
                topic: exam2.topic,
                scope: exam2.scope
            }
        );
        assert.strictEqual(updateExamResponse.statusCode, 404, 'Expected the status code to be 404 for an exam that does not exist.');
    });

    test('deleteExam() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');


        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createExamResponse = await sendPostRequest('/exam', {
            ...exam1,
            lessonId: lesson.id
        });
        assert.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');

        const deleteExamResponse = await sendDeleteRequest(`/exam/${createExamResponse.body.data.id}`);
        assert.strictEqual(deleteExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam deletion.');
        assert.strictEqual(deleteExamResponse.body.data.id, createExamResponse.body.data.id, 'Expected the deleted exam ID to match the created exam ID.');
    });

    test('deleteExam() - validation error', async () => {
        const deleteExamResponse = await sendDeleteRequest(`/exam/${invalidIdUrl}`);
        assert.strictEqual(deleteExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteExamResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteExam() - exam does not exist', async () => {
        const deleteExamResponse = await sendDeleteRequest(`/exam/${nonExistentId}`);
        assert.strictEqual(deleteExamResponse.statusCode, 404, 'Expected the status code to be 404 for an exam that does not exist.');
    });
});