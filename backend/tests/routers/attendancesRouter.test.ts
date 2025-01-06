import prisma from '../../src/db';
import test, { afterEach, beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest
} from '../../src/utils/requestHelpers';
import { className1, schoolYear1, semester1, teacher1, subject1, student1, student2, lessonsData1, invalidIdUrl, nonExistentId, emptyString } from '../../src/utils/testData';
import { attendances, lessons } from '@prisma/client';

suite('attendancesRouter', () => {
    afterEach(async () => {
        await prisma.attendances.deleteMany();
        await prisma.lessons.deleteMany();
        await prisma.students.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.semesters.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createAttendances() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        assert.strictEqual(createAttendancesResponse.body.data, 2, `Expected the number of created attendances to be 2.`);
    });

    test('createAttendances() - validation error (attendances is not an empty array)', async () => {
        const attendancesData = {
            lessonId: emptyString,
            attendances: [
                {
                    wasPresent: emptyString,
                    wasLate: emptyString,
                    wasExcused: emptyString,
                    studentId: emptyString
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createAttendancesResponse.body.errors.length, 5, 'Expected the number of validation errors to be 5.');
    });

    test('createAttendances() - validation error (attendances is an empty array)', async () => {
        const attendancesData = {
            lessonId: emptyString,
            attendances: []
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createAttendancesResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('createAttendances() - absent and simultaneously late', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });

    test('createAttendances() - present, not late and simultaneously excused', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was present, not late and excused at the same time.');
    });

    test('createAttendances() - lesson does not exist', async () => {
        const attendancesData = {
            lessonId: nonExistentId,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: nonExistentId
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('createAttendances() - student does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: nonExistentId
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a student does not exist.');
    });

    test('createAttendances() - attendances already exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData1 = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const attendancesData2 = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 409, 'Expected the status code to be 200 for attendances that already exist.');
    });

    test('getLessonAttendances() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesResponse = await sendGetRequest(`/attendance/${lesson.id}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
    });

    test('getLessonAttendances() - validation error', async () => {
        const getAttendancesResponse = await sendGetRequest(`/attendance/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getLessonAttendances() - lesson does not exist', async () => {
        const getAttendancesResponse = await sendGetRequest(`/attendance/${nonExistentId}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    // Might encouter errors because in attendances handler we base on current year and the test data might differ
    test('getAttendancesStatistics() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson1 = getLessonsResponse.body.data[0] as lessons;
        const lesson2 = getLessonsResponse.body.data[1] as lessons;

        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/statistics/${signUpResponse1.body.data}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances informations retrieval.');
        console.log(getAttendancesInfoResponse.body.data);
    });

    test('getAttendancesStatistics() - validation error', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/statistics/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getAttendancesStatistics() - student does not exist', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/statistics/${nonExistentId}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('getStudentAttendances() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson1 = getLessonsResponse.body.data[0] as lessons;
        const lesson2 = getLessonsResponse.body.data[1] as lessons;

        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getStudentAttendancesResponse = await sendGetRequest(`/attendance/student/${signUpResponse1.body.data}`);
        assert.strictEqual(getStudentAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getStudentAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        assert.ok(getStudentAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[1].lesson_id, lesson2.id, 'Expected the lesson ID to match the created lesson ID.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[1].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        assert.ok(getStudentAttendancesResponse.body.data[1].lesson, 'Expected the lesson property to exist.');
    });

    test('getStudentAttendances() - validation error', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/student/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getStudentAttendances() - student does not exist', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/student/${nonExistentId}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('getClassAttendances() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const assignStudentResponse1 = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse1.body.data }
        );
        assert.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const assignStudentResponse2 = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson1 = getLessonsResponse.body.data[0] as lessons;

        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getClassAttendancesResponse = await sendGetRequest(`/attendance/class/${createClassResponse.body.data.id}`);
        assert.strictEqual(getClassAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getClassAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
        assert.strictEqual(getClassAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        assert.strictEqual(getClassAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        assert.ok(getClassAttendancesResponse.body.data[0].student, 'Expected the student property to exist.');
        assert.ok(getClassAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
    });

    test('getClassAttendances() - validation error', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/class/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getClassAttendances() - class does not exist', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/class/${nonExistentId}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('getStudentAttendancesByDate() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const assignStudentResponse1 = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse1.body.data }
        );
        assert.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const assignStudentResponse2 = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson1 = getLessonsResponse.body.data[0] as lessons;
        const lesson2 = getLessonsResponse.body.data[1] as lessons;

        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getStudentAttendancesResponse = await sendGetRequest(`/attendance/student/${signUpResponse1.body.data}/by-date/${(lesson1.date as unknown as string).slice(0, 10)}`);
        assert.strictEqual(getStudentAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getStudentAttendancesResponse.body.data.length, 1, 'Expected the number of retrieved attendances to be 1.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        assert.strictEqual(getStudentAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        assert.ok(getStudentAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
        assert.ok(getStudentAttendancesResponse.body.data[0].lesson.subject, 'Expected the subject property to exist.');

    });

    test('getStudentAttendancesByDate() - validation error', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/student/${invalidIdUrl}/by-date/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesInfoResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('getStudentAttendancesByDate() - student does not exist', async () => {
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 10);

        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/student/${nonExistentId}/by-date/${formattedDate}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('updateAttendances() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createSubjectResponse = await sendPostRequest('/subject', subject1);
        assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

        const createSemesterResponse = await sendPostRequest('/semester', {
            ...semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data,
                },
                {
                    wasPresent: true,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse2.body.data,
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesResponse = await sendGetRequest(`/attendance/${lesson.id}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');

        const attendance1 = getAttendancesResponse.body.data[0] as attendances;
        const attendance2 = getAttendancesResponse.body.data[1] as attendances;

        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: attendance1.id,
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: false
                },
                {
                    id: attendance2.id,
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: false
                }
            ]
        };

        const updateAttendancesResponse = await sendPatchRequest(`/attendance/update`, attendancesUpdateData);
        assert.strictEqual(updateAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances update.');
        assert.strictEqual(updateAttendancesResponse.body.data[0].was_present, false, `Expected the updated attendance presence to be "false".`);
        assert.strictEqual(updateAttendancesResponse.body.data[0].was_late, false, `Expected the updated attendance late flag to be "false".`);
        assert.strictEqual(updateAttendancesResponse.body.data[0].was_excused, false, `Expected the updated attendance excused flag to be "false".`);
        assert.strictEqual(updateAttendancesResponse.body.data[1].was_present, false, `Expected the updated attendance presence to be "false".`);
        assert.strictEqual(updateAttendancesResponse.body.data[1].was_late, false, `Expected the updated attendance late flag to be "false".`);
        assert.strictEqual(updateAttendancesResponse.body.data[1].was_excused, false, `Expected the updated attendance excused flag to be "false".`);
    });

    test('updateAttendances() - validation error', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: emptyString,
                    wasPresent: emptyString,
                    wasLate: emptyString,
                    wasExcused: emptyString
                }
            ]
        };

        const updateAttendancesResponse = await sendPatchRequest(`/attendance/update`, attendancesUpdateData);
        assert.strictEqual(updateAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateAttendancesResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });

    test('updateAttendances() - absent and simultaneously late', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: nonExistentId,
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: true
                }
            ]
        };

        const updateAttendancesResponse = await sendPatchRequest(`/attendance/update`, attendancesUpdateData);
        assert.strictEqual(updateAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });

    test('updateAttendances() - present, not late and simultaneously excused', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: nonExistentId,
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: true
                }
            ]
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/update`, attendancesUpdateData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was present, not late and excused at the same time.');
    });

    test('updateAttendances() - attendance not found', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: nonExistentId,
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false
                }
            ]
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/update`, attendancesUpdateData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 404, 'Expected the status code to be 404 for a attendance that does not exist.');
    });
});