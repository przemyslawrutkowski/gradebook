import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { teacher1, subject1, lessonsData1, lessonsData2, nonExistentId, newDescription, invalidIdUrl, semester1, schoolYear1, className1, emptyString, student1, lessonsData3 } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('lessonsRouter', () => {
    afterEach(async () => {
        await prisma.students_parents.deleteMany();
        await prisma.students.deleteMany();
        await prisma.lessons.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.semesters.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createLessons() - success', async () => {
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
    });

    test('createLessons() - validation error', async () => {
        const createLessonsResponse = await sendPostRequest('/lesson', {
            startDate: emptyString,
            endDate: emptyString,
            teacherId: emptyString,
            classId: emptyString,
            subjectId: emptyString,
            lessonSchedules: [
                {
                    dayOfWeek: 7,
                    startTime: emptyString,
                    endTime: emptyString,
                    frequency: 0
                }
            ],
        });
        assert.strictEqual(createLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createLessonsResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9.');
    });

    test('createLessons() - teacher does not exist', async () => {
        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: nonExistentId,
            classId: nonExistentId,
            subjectId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });

    test('createLessons() - class does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const generateLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: signUpResponse.body.data,
            classId: nonExistentId,
            subjectId: nonExistentId
        });
        assert.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('createLessons() - subject does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

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
            subjectId: nonExistentId
        });
        assert.strictEqual(createLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('createLessons() - lessons already exist', async () => {
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
                teacherId: signUpResponse.body.data
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const createLessonsResponse2 = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse2.statusCode, 409, 'Expected the status code to be 409 for lessons that already exists.');
    });

    test('createLessons() - start date is not earlier than end date', async () => {
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

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...{
                startDate: '2023-12-21',
                endDate: '2023-12-15',
                lessonSchedules: [
                    {
                        dayOfWeek: 2,
                        startTime: '12:00',
                        endTime: '13:00',
                        frequency: 1
                    }, {
                        dayOfWeek: 5,
                        startTime: '15:00',
                        endTime: '16:00',
                        frequency: 2
                    }
                ],
            },
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });

    test('getLessons() - success', async () => {
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

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });

    test('getLessons() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/${invalidIdUrl}/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('getLessons() - class does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/${nonExistentId}/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getLessons() - subject does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('getAllLessons() - success', async () => {
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

        const getLessonsResponse = await sendGetRequest(`/lesson`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });

    test('GetLessonsByClassId() - success', async () => {
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

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/class/${createClassResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });

    test('GetLessonsByClassId() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/class/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('GetLessonsByClassId() - class does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/class/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('GetLessonsForUser() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

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

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/user/${signUpResponse2.body.data}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });

    test('GetLessonsForUser() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/user/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('GetLessonsForUser() - user does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/user/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('GetLessonsForUser() - user does not exist', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const getLessonsResponse = await sendGetRequest(`/lesson/user/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('GetLessonsThreeDaysBack() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

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
                teacherId: signUpResponse1.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData3,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/back/${signUpResponse2.body.data}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons three days back retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 1, 'Expected the number of retrieved lessons to be 1.');
    });

    test('GetLessonsThreeDaysBack() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/back/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('GetLessonsThreeDaysBack() - user does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/back/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('getLessonsThreeDaysAhead() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

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
                teacherId: signUpResponse1.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const createLessonsResponse1 = await sendPostRequest('/lesson', {
            ...lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/ahead/${signUpResponse2.body.data}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons three days ahead retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });

    test('getLessonsThreeDaysAhead() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/ahead/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getLessonsThreeDaysAhead() - user does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/ahead/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('getLessonsToday() - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

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
                teacherId: signUpResponse1.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse2.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const createLessonsResponse = await sendPostRequest('/lesson', {
            ...lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/today/${signUpResponse2.body.data}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons today retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 1, 'Expected the number of retrieved lessons to be 1.');
    });

    test('getLessonsToday() - validation error', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/today/${invalidIdUrl}`);
        assert.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getLessonsToday() - user does not exist', async () => {
        const getLessonsResponse = await sendGetRequest(`/lesson/today/${nonExistentId}`);
        assert.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });

    test('updateLesson() - success', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const updateLessonResponse = await sendPatchRequest(`/lesson/${lesson.id}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson update.');
        assert.strictEqual(updateLessonResponse.body.data.description, newDescription, `Expected the updated lesson description to be "${newDescription}".`);
    });

    test('updateLesson() - validation error', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${invalidIdUrl}`, {
            description: emptyString
        });
        assert.strictEqual(updateLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateLessonResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateLesson() - lesson does not exist', async () => {
        const updateLessonResponse = await sendPatchRequest(`/lesson/${nonExistentId}`, {
            description: newDescription
        });
        assert.strictEqual(updateLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('deleteLessonsByClassAndSubjectIds() - success', async () => {
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

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${createClassResponse.body.data.id}/subject/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        assert.strictEqual(deleteLessonsResponse.body.data, 6, 'Expected the number of deleted lessons to be 6.');
    });

    test('deleteLessonsByClassAndSubjectIds() - validation error', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${invalidIdUrl}/subject/${invalidIdUrl}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('deleteLessonsByClassAndSubjectIds() - class does not exist', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${nonExistentId}/subject/${nonExistentId}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('deleteLessonsByClassAndSubjectIds() - subject does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${createClassResponse.body.data.id}/subject/${nonExistentId}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });

    test('deleteLessonsByClassIdAndDate() - success', async () => {
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

        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${createClassResponse.body.data.id}/date/2024-10-04`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        assert.strictEqual(deleteLessonsResponse.body.data, 1, 'Expected the number of deleted lessons to be 1.');
    });

    test('deleteLessonsByClassIdAndDate() - validation error', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${invalidIdUrl}/date/${invalidIdUrl}`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('deleteLessonsByClassIdAndDate() - class does not exist', async () => {
        const deleteLessonsResponse = await sendDeleteRequest(`/lesson/class/${nonExistentId}/date/2024-10-04`);
        assert.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('deleteLesson() - success', async () => {
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

        const getLessonsResponse = await sendGetRequest(`/lesson/user/${signUpResponse.body.data}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const deleteLessonResponse = await sendDeleteRequest(`/lesson/${lesson.id}`);
        assert.strictEqual(deleteLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson deletion.');
        assert.strictEqual(deleteLessonResponse.body.data.id, lesson.id, 'Expected the deleted lesson Id to match the created lesson Id.');
    });

    test('deleteLesson() - validation error', async () => {
        const deleteLessonResponse = await sendDeleteRequest(`/lesson/${invalidIdUrl}`);
        assert.strictEqual(deleteLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteLessonResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteLesson() - lesson does not exist', async () => {
        const deleteLessonResponse = await sendDeleteRequest(`/lesson/${nonExistentId}`);
        assert.strictEqual(deleteLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
});