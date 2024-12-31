import prisma from '../../src/db';
import test, { afterEach, beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { className1, schoolYear1, student1, teacher1, subject1, nonExistentId, invalidIdUrl, emptyString, semester1, lessonsData1, homework1, homework2 } from '../../src/utils/testData';
import { lessons } from '@prisma/client';

suite('homeworksRouter', () => {
    afterEach(async () => {
        await prisma.homeworks.deleteMany();
        await prisma.students.deleteMany();
        await prisma.lessons.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.subjects.deleteMany();
        await prisma.semesters.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createHomework() - success', async () => {
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
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createHomeworkResponse = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        assert.strictEqual(createHomeworkResponse.body.data.description, homework1.description, `Expected the description to be "${homework1.description}".`);
        assert.strictEqual(createHomeworkResponse.body.data.deadline, new Date(homework1.deadline).toISOString(), `Expected the deadline to be "${homework1.deadline}".`);
        assert.strictEqual(createHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });


    test('createHomework() - validation error', async () => {
        const createHomeworkResponse = await sendPostRequest('/homework', {
            description: emptyString,
            deadline: emptyString,
            lessonId: emptyString
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createHomeworkResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });

    test('createHomework() - lesson does not exist', async () => {
        const createHomeworkResponse = await sendPostRequest('/homework', {
            description: homework1.description,
            deadline: homework1.deadline,
            lessonId: nonExistentId
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });

    test('createHomework() - homework already exists', async () => {
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
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createHomeworkResponse1 = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id,
            teacherId: signUpResponse.body.data
        });
        assert.strictEqual(createHomeworkResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');

        const createHomeworkResponse2 = await sendPostRequest('/homework', {
            ...homework2,
            lessonId: lesson.id,
            teacherId: signUpResponse.body.data
        });
        assert.strictEqual(createHomeworkResponse2.statusCode, 409, 'Expected the status code to be 409 for homework that already exists.');
    });

    test('getHomework() - success', async () => {
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
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createHomeworkResponse = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');

        const getHomeworkResponse = await sendGetRequest(`/homework/${lesson.id}`);
        assert.strictEqual(getHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework retrieval.');
        assert.strictEqual(getHomeworkResponse.body.data.description, homework1.description, `Expected the description to be "${homework1.description}".`);
        assert.strictEqual(getHomeworkResponse.body.data.deadline, new Date(homework1.deadline).toISOString(), `Expected the deadline to be "${homework1.deadline}".`);
        assert.strictEqual(getHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });

    test('getHomework() - validation error', async () => {
        const getHomeworkResponse = await sendGetRequest(`/homework/${invalidIdUrl}`);
        assert.strictEqual(getHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getHomework() - lesson does not exist', async () => {
        const getHomeworkResponse = await sendGetRequest(`/homework/${nonExistentId}`);
        assert.strictEqual(getHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getLatestHomework() - success', async () => {
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
            ...lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
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

        const createHomeworkResponse = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');

        const getLatestHomeworkResponse = await sendGetRequest(`/homework/latest/${signUpResponse2.body.data}`);
        assert.strictEqual(getLatestHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful latest homework retrieval.');
        assert.strictEqual(getLatestHomeworkResponse.body.data.description, homework1.description, `Expected the description to be "${homework1.description}".`);
        assert.strictEqual(getLatestHomeworkResponse.body.data.deadline, new Date(homework1.deadline).toISOString(), `Expected the deadline to be "${homework1.deadline}".`);
        assert.strictEqual(getLatestHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });

    test('getLatestHomework() - validation error', async () => {
        const getLatestHomeworkResponse = await sendGetRequest(`/homework/latest/${invalidIdUrl}`);
        assert.strictEqual(getLatestHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getLatestHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getLatestHomework() - student does not exist', async () => {
        const getLatestHomeworkResponse = await sendGetRequest(`/homework/latest/${nonExistentId}`);
        assert.strictEqual(getLatestHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('getLatestHomework() - student is not assigned to any class', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const getLatestHomeworkResponse = await sendGetRequest(`/homework/latest/${signUpResponse.body.data}`);
        assert.strictEqual(getLatestHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a student that is not assigned to any class.');
    });

    test('updateHomework() - success', async () => {
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
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createHomeworkResponse = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');

        const updateHomeworkResponse = await sendPatchRequest(
            `/homework/${createHomeworkResponse.body.data.id}`,
            {
                description: homework2.description,
                deadline: homework2.deadline
            }
        );
        assert.strictEqual(updateHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework update.');
        assert.strictEqual(updateHomeworkResponse.body.data.description, homework2.description, `Expected the updated description to be "${homework2.description}".`);
        assert.strictEqual(updateHomeworkResponse.body.data.deadline, new Date(homework2.deadline).toISOString(), `Expected the updated deadline to be "${homework2.deadline}".`);
    });

    test('updateHomework() - validation error', async () => {
        const updateHomeworkResponse = await sendPatchRequest(`/homework/${invalidIdUrl}`, {
            description: emptyString,
            deadline: emptyString
        });
        assert.strictEqual(updateHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateHomeworkResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateHomework() - homework does not exist', async () => {
        const updateHomeworkResponse = await sendPatchRequest(
            `/homework/${nonExistentId}`,
            {
                description: homework2.description,
                deadline: homework2.deadline
            }
        );
        assert.strictEqual(updateHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a homework that does not exist.');
    });

    test('deleteHomework() - success', async () => {
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
            semesterId: createSemesterResponse.body.data.id
        });
        assert.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        assert.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');

        const getLessonsResponse = await sendGetRequest(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        assert.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        assert.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');

        const lesson = getLessonsResponse.body.data[0] as lessons;

        const createHomeworkResponse = await sendPostRequest('/homework', {
            ...homework1,
            lessonId: lesson.id
        });
        assert.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');

        const deleteHomeworkResponse = await sendDeleteRequest(`/homework/${createHomeworkResponse.body.data.id}`);
        assert.strictEqual(deleteHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework deletion.');
        assert.strictEqual(deleteHomeworkResponse.body.data.id, createHomeworkResponse.body.data.id, 'Expected the deleted homework ID to match the created homework ID.');
    });

    test('deleteHomework() - validation error', async () => {
        const deleteHomeworkResponse = await sendDeleteRequest(`/homework/${invalidIdUrl}`);
        assert.strictEqual(deleteHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteHomework() - homework does not exist', async () => {
        const deleteHomeworkResponse = await sendDeleteRequest(`/homework/${nonExistentId}`);
        assert.strictEqual(deleteHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a homework that does not exist.');
    });
});