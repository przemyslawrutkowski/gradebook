import prisma from '../../src/db';
import test, { afterEach, beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest
} from '../../src/utils/requestHelpers';
import { className1, schoolYear1, semester1, teacher1, subject1, student1, student2, lessonsData, invalidIdUrl, nonExistentId, emptyString, schoolYear3 } from '../../src/utils/testData';
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
            ...lessonsData,
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
                    studentId: signUpResponse1.body.data,
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    studentId: signUpResponse2.body.data,
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
                    studentId: emptyString,
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createAttendancesResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
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
            ...lessonsData,
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
                    studentId: signUpResponse1.body.data,
                },
                {
                    wasPresent: false,
                    wasLate: true,
                    studentId: signUpResponse2.body.data,
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });

    test('createAttendances() - lesson does not exist', async () => {
        const attendancesData = {
            lessonId: nonExistentId,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    studentId: nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
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
            ...lessonsData,
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
                    studentId: nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
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
            ...lessonsData,
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
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 409, 'Expected the status code to be 200 for attendances that already exist.');
    });

    //There is no such possibility of creating attendances list again

    test('getAttendances() - success', async () => {
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
            ...lessonsData,
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
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesResponse = await sendGetRequest(`/attendance/${lesson.id}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });

    test('getAttendances() - validation error', async () => {
        const getAttendancesResponse = await sendGetRequest(`/attendance/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getAttendances() - lesson does not exist', async () => {
        const getAttendancesResponse = await sendGetRequest(`/attendance/${nonExistentId}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    // Might encouter errors because in attendances handler we base on current year and the test data might differ
    test('getAttendancesInformations() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear3);
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
            ...lessonsData,
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
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
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
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };

        const createAttendancesResponse1 = await sendPostRequest('/attendance', attendancesData1);
        assert.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const createAttendancesResponse2 = await sendPostRequest('/attendance', attendancesData2);
        assert.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/informations/${signUpResponse1.body.data}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances informations retrieval.');
        console.log(getAttendancesInfoResponse.body.data);
    });

    test('getAttendancesInformations() - validation error', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/informations/${invalidIdUrl}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getAttendancesInformations() - student does not exist', async () => {
        const getAttendancesInfoResponse = await sendGetRequest(`/attendance/informations/${nonExistentId}`);
        assert.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('updateAttendance() - success', async () => {
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
            ...lessonsData,
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
                    studentId: signUpResponse1.body.data,
                },
                {
                    wasPresent: true,
                    wasLate: true,
                    studentId: signUpResponse2.body.data,
                }
            ]
        };

        const createAttendancesResponse = await sendPostRequest('/attendance', attendancesData);
        assert.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');

        const getAttendancesResponse = await sendGetRequest(`/attendance/${lesson.id}`);
        assert.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        assert.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');

        const attendance = getAttendancesResponse.body.data[0] as attendances;

        const updatedAttendanceData = {
            wasPresent: false,
            wasLate: false
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${attendance.id}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendance update.');
        assert.strictEqual(updateAttendanceResponse.body.data.was_present, false, `Expected the updated attendance presence to be "false".`);
        assert.strictEqual(updateAttendanceResponse.body.data.was_late, false, `Expected the updated attendance late flag to be "false".`);
    });

    test('updateAttendance() - validation error', async () => {
        const updatedAttendanceData = {
            wasPresent: emptyString,
            wasLate: emptyString
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${invalidIdUrl}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateAttendanceResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });

    test('updateAttendance() - absent and simultaneously late', async () => {
        const updatedAttendanceData = {
            wasPresent: false,
            wasLate: true
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${nonExistentId}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });

    test('updateAttendance() - attendance not found', async () => {
        const updatedAttendanceData = {
            wasPresent: true,
            wasLate: false
        };

        const updateAttendanceResponse = await sendPatchRequest(`/attendance/${nonExistentId}`, updatedAttendanceData);
        assert.strictEqual(updateAttendanceResponse.statusCode, 404, 'Expected the status code to be 404 for a attendance that does not exist.');
    });
});