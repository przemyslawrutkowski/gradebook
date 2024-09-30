// import prisma from '../../src/db';
// import test, { afterEach, suite } from 'node:test';
// import assert from 'node:assert';
// import {
//     sendPostRequest,
//     sendGetRequest,
//     sendPatchRequest,
//     sendDeleteRequest,
// } from '../../src/utils/requestHelpers';

// suite('classesRouter', () => {
//     afterEach(async () => {
//         await prisma.students.deleteMany();
//         await prisma.classes.deleteMany();
//         await prisma.teachers.deleteMany();
//     });

//     test('createClass() - success', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');
//         assert.strictEqual(createClassResponse.body.data.name, 'IA', 'Expected class name to be "IA"');
//         assert.strictEqual(createClassResponse.body.data.yearbook, '2024/2025', 'Expected yearbook to be "2024/2025"');
//     });

//     test('createClass() - validation error', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: '',
//             yearbook: '',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 400, 'Expected status code 400 for validation error');
//         assert.strictEqual(createClassResponse.body.errors.length, 2, 'Expected 2 validation errors');
//     });

//     test('createClass() - class exists', async () => {
//         const createClassResponse1 = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const createClassResponse2 = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse2.statusCode, 409, 'Expected status code 409 for class already exists');
//     });

//     test('getClasses() - success', async () => {
//         const createClassResponse1 = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse1.statusCode, 200, 'Expected status code 200 for first successful class creation');

//         const createClassResponse2 = await sendPostRequest('/class', {
//             name: 'IIA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse2.statusCode, 200, 'Expected status code 200 for second successful class creation');

//         const getClassesResponse = await sendGetRequest('/class');


//         assert.strictEqual(getClassesResponse.statusCode, 200, 'Expected status code 200 for getting classes');
//         assert.strictEqual(getClassesResponse.body.data.length, 2, 'Expected 2 classes in the response');
//     });

//     test('getStudents() - success', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', {
//             pesel: '11111111111',
//             email: 'student1@student.com',
//             phoneNumber: '601234567',
//             password: 'password',
//             passwordConfirm: 'password',
//             firstName: 'Student',
//             lastName: 'Student'
//         });

//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected status code 200 for first successful student signup');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/student', {
//             pesel: '22222222222',
//             email: 'student2@student.com',
//             phoneNumber: '601234568',
//             password: 'password',
//             passwordConfirm: 'password',
//             firstName: 'Student',
//             lastName: 'Student'
//         });

//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected status code 200 for second successful student signup');

//         const assignStudentResponse1 = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}/assign-student`,
//             {
//                 studentId: signUpResponse1.body.data,
//             }
//         );

//         assert.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected status code 200 for first successful student assignment');

//         const assignStudentResponse2 = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}/assign-student`,
//             {
//                 studentId: signUpResponse2.body.data,
//             }
//         );

//         assert.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected status code 200 for second successful student assignment');

//         const getStudentsResponse = await sendGetRequest(
//             `/class/${createClassResponse.body.data.id}/students`
//         );

//         assert.strictEqual(getStudentsResponse.statusCode, 200, 'Expected status code 200 for getting students');
//         assert.strictEqual(getStudentsResponse.body.data.length, 2, 'Expected 2 students in the response');
//     });

//     test('getStudents() - validation error', async () => {
//         const invalidId = '%20';

//         const getStudentsResponse = await sendGetRequest(
//             `/class/${invalidId}/students`
//         );

//         assert.strictEqual(getStudentsResponse.statusCode, 400, 'Expected status code 400 for validation error');
//         assert.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected 1 validation error');
//     });

//     test('getStudents() - class does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const getStudentsResponse = await sendGetRequest(
//             `/class/${invalidId}/students`
//         );

//         assert.strictEqual(getStudentsResponse.statusCode, 404, 'Expected status code 404 for class not found');
//     });

//     test('updateClass() - success', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const signUpResponse = await sendPostRequest('/auth/signup/teacher', {
//             pesel: '11111111111',
//             email: 'teacher@teacher.com',
//             phoneNumber: '555555555',
//             password: 'password',
//             passwordConfirm: 'password',
//             firstName: 'John',
//             lastName: 'Doe',
//         });

//         assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful teacher signup');

//         const updateClassReponse = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}`,
//             {
//                 name: 'IIA',
//                 yearbook: '2025/2026',
//                 teacherId: signUpResponse.body.data,
//             }
//         );


//         assert.strictEqual(updateClassReponse.statusCode, 200, 'Expected status code 200 for successful class update');
//         assert.strictEqual(updateClassReponse.body.data.name, 'IIA', 'Expected updated class name to be "IIA"');
//         assert.strictEqual(updateClassReponse.body.data.yearbook, '2025/2026', 'Expected updated yearbook to be "2025/2026"');
//         assert.strictEqual(updateClassReponse.body.data.teacher_id, signUpResponse.body.data, 'Expected updated teacher ID to match');
//     });

//     test('updateClass() - validation error', async () => {
//         const invalidId = '%20';

//         const updateClassReponse = await sendPatchRequest(
//             `/class/${invalidId}`,
//             {
//                 name: '',
//                 yearbook: '',
//                 teacherId: ''
//             }
//         );

//         assert.strictEqual(updateClassReponse.statusCode, 400, 'Expected status code 400 for validation error');
//         assert.strictEqual(updateClassReponse.body.errors.length, 2, 'Expected 2 validation errors');
//     });

//     test('updateClass() - class does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const updateClassReponse = await sendPatchRequest(
//             `/class/${invalidId}`,
//             {
//                 name: 'IIA',
//                 yearbook: '2025/2026'
//             }
//         );

//         assert.strictEqual(updateClassReponse.statusCode, 404, 'Expected status code 404 for class not found');
//     });

//     test('updateClass() - teacher does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const updateClassReponse = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}`,
//             {
//                 teacherId: invalidId
//             }
//         );

//         assert.strictEqual(updateClassReponse.statusCode, 404, 'Expected status code 404 for teacher not found');
//     });

//     test('assignStudent() - success', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const signUpResponse = await sendPostRequest('/auth/signup/student', {
//             pesel: '11111111111',
//             email: 'student@student.com',
//             phoneNumber: '555555555',
//             password: 'password',
//             passwordConfirm: 'password',
//             firstName: 'John',
//             lastName: 'Doe',
//         });

//         assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful student signup');

//         const assignStudentReponse = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}/assign-student`,
//             {
//                 studentId: signUpResponse.body.data
//             }
//         );

//         assert.strictEqual(assignStudentReponse.statusCode, 200, 'Expected status code 200 for successful student assignment');
//         assert.strictEqual(assignStudentReponse.body.data.class_id, createClassResponse.body.data.id, 'Expected assigned student to be in the correct class');
//     });

//     test('assignStudent() - validation error', async () => {
//         const invalidClassId = '%20';

//         const assignStudentReponse = await sendPatchRequest(
//             `/class/${invalidClassId}/assign-student`,
//             {
//                 studentId: ''
//             }
//         );

//         assert.strictEqual(assignStudentReponse.statusCode, 400, 'Expected status code 400 for validation error');
//         assert.strictEqual(assignStudentReponse.body.errors.length, 2, 'Expected 2 validation errors');
//     });

//     test('assignStudent() - class does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const assignStudentReponse = await sendPatchRequest(
//             `/class/${invalidId}/assign-student`,
//             {
//                 studentId: invalidId
//             }
//         );

//         assert.strictEqual(assignStudentReponse.statusCode, 404, 'Expected status code 404 for class not found');
//     });

//     test('assignStudent() - student does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const assignStudentReponse = await sendPatchRequest(
//             `/class/${createClassResponse.body.data.id}/assign-student`,
//             {
//                 studentId: invalidId
//             }
//         );

//         assert.strictEqual(assignStudentReponse.statusCode, 404, 'Expected status code 404 for student not found');
//     });

//     test('deleteClass() - success', async () => {
//         const createClassResponse = await sendPostRequest('/class', {
//             name: 'IA',
//             yearbook: '2024/2025',
//         });

//         assert.strictEqual(createClassResponse.statusCode, 200, 'Expected status code 200 for successful class creation');

//         const deleteClassReponse = await sendDeleteRequest(`/class/${createClassResponse.body.data.id}`);

//         assert.strictEqual(deleteClassReponse.statusCode, 200, 'Expected status code 200 for successful class deletion');
//         assert.strictEqual(deleteClassReponse.body.data.id, createClassResponse.body.data.id, 'Expected deleted class ID to match created class ID');
//     });

//     test('deleteClass() - validation error', async () => {
//         const invalidId = '%20';

//         const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

//         assert.strictEqual(deleteClassReponse.statusCode, 400, 'Expected status code 400 for validation error');
//         assert.strictEqual(deleteClassReponse.body.errors.length, 1, 'Expected 1 validation error');
//     });

//     test('deleteClass() - class does not exist', async () => {
//         const invalidId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';

//         const deleteClassReponse = await sendDeleteRequest(`/class/${invalidId}`);

//         assert.strictEqual(deleteClassReponse.statusCode, 404, 'Expected status code 404 for class not found');
//     });
// });