import prisma from '../../src/db';
import test, { afterEach, beforeEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { className1, className2, schoolYear1, schoolYear2, student1, student2, teacher1, nonExistentId, invalidIdUrl, emptyString } from '../../src/utils/testData';

suite('classesRouter', () => {
    afterEach(async () => {
        await prisma.students.deleteMany();
        await prisma.classes.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.class_names.deleteMany();
        await prisma.school_years.deleteMany();
    });

    test('createClass() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        assert.strictEqual(createClassResponse.body.data.class_name_id, createClassNameResponse.body.data.id, 'Expected the class name ID to match the created class name ID.');
        assert.strictEqual(createClassResponse.body.data.school_year_id, createSchoolYearResponse.body.data.id, 'Expected the school year ID to match the created school year ID.');
    });

    test('createClass() - validation error', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            classNameId: emptyString,
            schoolYearId: emptyString,
        });
        assert.strictEqual(createClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(createClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('createClass() - class name does not exist', async () => {
        const createClassResponse = await sendPostRequest('/class', {
            classNameId: nonExistentId,
            schoolYearId: nonExistentId
        });
        assert.strictEqual(createClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });

    test('createClass() - school year does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: nonExistentId
        });
        assert.strictEqual(createClassResponse.statusCode, 404, 'Expected the status code to be 200 for a school year does not exist.');
    });

    test('createClass() - class already exists', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse1 = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createClassResponse2 = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse2.statusCode, 409, 'Expected the status code to be 409 for a class that already exists.');
    });

    test('getClasses() - success', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className2);
        assert.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse1 = await sendPostRequest('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const createClassResponse2 = await sendPostRequest('/class', {
            classNameId: createClassNameResponse2.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getClassesResponse = await sendGetRequest('/class');
        assert.strictEqual(getClassesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful classes retrieval.');
        assert.strictEqual(getClassesResponse.body.data.length, 2, 'Expected the number of retrieved classes to be 2.');
    });

    test('getClassById() - success', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const getClassByIdResponse = await sendGetRequest(`/class/${createClassResponse.body.data.id}`);
        assert.strictEqual(getClassByIdResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class retrieval.');
        assert.strictEqual(getClassByIdResponse.body.data.id, createClassResponse.body.data.id, 'Expected the class ID to match the created class ID.');
        assert.strictEqual(getClassByIdResponse.body.data.class_name_id, createClassResponse.body.data.class_name_id, 'Expected the class name ID to match the created class name ID.');
        assert.strictEqual(getClassByIdResponse.body.data.school_year_id, createClassResponse.body.data.school_year_id, 'Expected the school year ID to match the created school year ID.');
    });

    test('getClassById() - validation error', async () => {
        const getClassByIdResponse = await sendGetRequest(`/class/${invalidIdUrl}`);
        assert.strictEqual(getClassByIdResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getClassByIdResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getClassById() - class does not exist', async () => {
        const getClassByIdResponse = await sendGetRequest(`/class/${nonExistentId}`);
        assert.strictEqual(getClassByIdResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getStudents() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

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

        const getStudentsResponse = await sendGetRequest(`/class/students/${createClassResponse.body.data.id}`);
        assert.strictEqual(getStudentsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful students retrieval.');
        assert.strictEqual(getStudentsResponse.body.data.length, 2, 'Expected the number of retrieved students to be 2.');
    });

    test('getStudents() - validation error', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/students/${invalidIdUrl}`);
        assert.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getStudents() - class does not exist', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/students/${nonExistentId}`);
        assert.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getStudentClassId() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const getStudentClassIdResponse = await sendGetRequest(`/class/student/${signUpResponse.body.data}`);
        assert.strictEqual(getStudentClassIdResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student\'s class ID retrieval.');
        assert.strictEqual(getStudentClassIdResponse.body.data, createClassResponse.body.data.id, 'Expected the class ID to match the created class ID.');
    });

    test('getStudentClassId() - validation error', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/student/${invalidIdUrl}`);
        assert.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('getStudentClassId() - student does not exist', async () => {
        const getStudentsResponse = await sendGetRequest(`/class/student/${nonExistentId}`);
        assert.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('getStudentClassId() - student is not assigned to any class', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const getStudentClassIdResponse = await sendGetRequest(`/class/student/${signUpResponse.body.data}`);
        assert.strictEqual(getStudentClassIdResponse.statusCode, 404, 'Expected the status code to be 404 for a student that is not assigned to any class.');
    });

    test('updateClass() - success', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className2);
        assert.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse1 = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSchoolYearResponse2 = await sendPostRequest('/school-year', schoolYear2);
        assert.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse1.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                classNameId: createClassNameResponse2.body.data.id,
                schoolYearId: createSchoolYearResponse2.body.data.id,
                teacherId: signUpResponse.body.data,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        assert.strictEqual(updateClassResponse.body.data.class_name_id, createClassNameResponse2.body.data.id, 'Expected the updated class name ID to match the created class name ID.');
        assert.strictEqual(updateClassResponse.body.data.school_year_id, createSchoolYearResponse2.body.data.id, 'Expected the updated school year ID to match the created school year ID.');
        assert.strictEqual(updateClassResponse.body.data.teacher_id, signUpResponse.body.data, 'Expected the updated teacher ID to match the created teacher ID.');
    });

    test('updateClass() - validation error', async () => {
        const updateClassResponse = await sendPatchRequest(`/class/${invalidIdUrl}`, {
            classNameId: emptyString,
            schoolYearId: emptyString,
            teacherId: emptyString,
        });
        assert.strictEqual(updateClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(updateClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('updateClass() - class does not exist', async () => {
        const updateClassResponse = await sendPatchRequest(
            `/class/${nonExistentId}`,
            {
                classNameId: nonExistentId,
                schoolYearId: nonExistentId,
                teacherId: nonExistentId,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('updateClass() - class name does not exist', async () => {
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
                classNameId: nonExistentId,
                schoolYearId: nonExistentId,
                teacherId: nonExistentId,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });

    test('updateClass() - school year does not exist', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className2);
        assert.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                classNameId: createClassNameResponse2.body.data.id,
                schoolYearId: nonExistentId,
                teacherId: nonExistentId,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });

    test('updateClass() - teacher does not exist', async () => {
        const createClassNameResponse1 = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createClassNameResponse2 = await sendPostRequest('/class-name', className2);
        assert.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse1 = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createSchoolYearResponse2 = await sendPostRequest('/school-year', schoolYear2);
        assert.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/teacher', teacher1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse1.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const updateClassResponse = await sendPatchRequest(
            `/class/${createClassResponse.body.data.id}`,
            {
                classNameId: createClassNameResponse2.body.data.id,
                schoolYearId: createSchoolYearResponse2.body.data.id,
                teacherId: nonExistentId,
            }
        );
        assert.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });

    test('assignStudent() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        assert.strictEqual(assignStudentResponse.body.data.class_id, createClassResponse.body.data.id, 'Expected the assigned student to be in the correct class.');
    });

    test('assignStudent() - validation error', async () => {
        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${invalidIdUrl}`,
            { studentId: emptyString }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(assignStudentResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('assignStudent() - class does not exist', async () => {
        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${nonExistentId}`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('assignStudent() - student does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });

    test('unassignStudent() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

        const assignStudentResponse = await sendPatchRequest(
            `/class/assign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse.body.data }
        );
        assert.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');

        const unassignStudentResponse = await sendPatchRequest(
            `/class/unassign-student/${createClassResponse.body.data.id}`,
            { studentId: signUpResponse.body.data }
        );

        assert.strictEqual(unassignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student unassignment.');
        assert.strictEqual(unassignStudentResponse.body.data.class_id, null, 'Expected class ID to be a null.');
    });

    test('unassignStudent() - validation error', async () => {
        const unassignStudentResponse = await sendPatchRequest(
            `/class/unassign-student/${invalidIdUrl}`,
            { studentId: emptyString }
        );
        assert.strictEqual(unassignStudentResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(unassignStudentResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('unassignStudent() - class does not exist', async () => {
        const unassignStudentResponse = await sendPatchRequest(
            `/class/unassign-student/${nonExistentId}`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(unassignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });

    test('unassignStudent() - student does not exist', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const unassignStudentResponse = await sendPatchRequest(
            `/class/unassign-student/${createClassResponse.body.data.id}`,
            { studentId: nonExistentId }
        );
        assert.strictEqual(unassignStudentResponse.statusCode, 404, 'Expected the status code to be 200 for a student that does not exist.');
    });

    test('deleteClass() - success', async () => {
        const createClassNameResponse = await sendPostRequest('/class-name', className1);
        assert.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');

        const createSchoolYearResponse = await sendPostRequest('/school-year', schoolYear1);
        assert.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');

        const createClassResponse = await sendPostRequest('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        assert.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');

        const deleteClassResponse = await sendDeleteRequest(`/class/${createClassResponse.body.data.id}`);
        assert.strictEqual(deleteClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class deletion.');
        assert.strictEqual(deleteClassResponse.body.data.id, createClassResponse.body.data.id, 'Expected the deleted class ID to match the created class ID.');
    });

    test('deleteClass() - validation error', async () => {
        const deleteClassResponse = await sendDeleteRequest(`/class/${invalidIdUrl}`);
        assert.strictEqual(deleteClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(deleteClassResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('deleteClass() - class does not exist', async () => {
        const deleteClassResponse = await sendDeleteRequest(`/class/${nonExistentId}`);
        assert.strictEqual(deleteClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
});