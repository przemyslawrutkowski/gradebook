// import prisma from '../../src/db';
// import test, { afterEach, beforeEach, suite } from 'node:test';
// import assert from 'node:assert';
// import {
//     sendPostRequest,
//     sendGetRequest,
//     sendPatchRequest,
//     sendDeleteRequest,
// } from '../../src/utils/requestHelpers';
// import { student1, teacher1, subject1, nonExistentId, invalidIdUrl, grade1, grade2, emptyString } from '../../src/utils/testData';

// suite('examsRouter', () => {
//     afterEach(async () => {
//         await prisma.students.deleteMany();
//         await prisma.exams.deleteMany();
//         await prisma.lessons.deleteMany();
//     });

//     test('createExam() - success', async () => {
//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/teacher', teacher1);
//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
//         assert.strictEqual(createGradeResponse.body.data.description, grade1.description, `Expected the description to be "${grade1.description}".`);
//         assert.strictEqual(createGradeResponse.body.data.grade, grade1.grade, `Expected the grade to be "${grade1.grade}".`);
//         assert.strictEqual(createGradeResponse.body.data.weight, grade1.weight, `Expected the weight to be "${grade1.weight}".`);
//         assert.strictEqual(createGradeResponse.body.data.student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
//         assert.strictEqual(createGradeResponse.body.data.subject_id, createSubjectResponse.body.data.id, 'Expected the subject ID to match the created subject ID.');
//         assert.strictEqual(createGradeResponse.body.data.teacher_id, signUpResponse2.body.data, 'Expected the teacher ID to match the created teacher ID.');
//     });


//     test('createGrade() - validation error', async () => {
//         const createGradeResponse = await sendPostRequest('/grade', {
//             description: emptyString,
//             grade: 0,
//             weight: 0,
//             studentId: emptyString,
//             subjectId: emptyString,
//             teacherId: emptyString,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
//         assert.strictEqual(createGradeResponse.body.errors.length, 6, 'Expected the number of validation errors to be 6.');
//     });

//     test('createGrade() - student does not exist', async () => {
//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: nonExistentId,
//             subjectId: nonExistentId,
//             teacherId: nonExistentId,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
//     });

//     test('createGrade() - subject does not exist', async () => {
//         const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse.body.data,
//             subjectId: nonExistentId,
//             teacherId: nonExistentId,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
//     });

//     test('createGrade() - teacher does not exist', async () => {
//         const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: nonExistentId,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
//     });

//     test('getGrades() - success', async () => {
//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/teacher', teacher1);
//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse1 = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const createGradeResponse2 = await sendPostRequest('/grade', {
//             ...grade2,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const getGradesResponse = await sendGetRequest(`/grade/${signUpResponse1.body.data}/${createSubjectResponse.body.data.id}`);
//         assert.strictEqual(getGradesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grades retrieval.');
//         assert.strictEqual(getGradesResponse.body.data.length, 2, 'Expected the number of retrieved grades to be 2.');
//     });

//     test('getGrades() - validation error', async () => {
//         const getGradesResponse = await sendGetRequest(`/grade/${invalidIdUrl}/${invalidIdUrl}`);
//         assert.strictEqual(getGradesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
//         assert.strictEqual(getGradesResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
//     });

//     test('getGrades() - student does not exist', async () => {
//         const getGradesResponse = await sendGetRequest(`/grade/${nonExistentId}/${nonExistentId}`);
//         assert.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
//     });

//     test('getGrades() - subject does not exist', async () => {
//         const signUpResponse = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const getGradesResponse = await sendGetRequest(`/grade/${signUpResponse.body.data}/${nonExistentId}`);
//         assert.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
//     });

//     test('getThreeLatestGrades() - success', async () => {
//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/teacher', teacher1);
//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse1 = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const createGradeResponse2 = await sendPostRequest('/grade', {
//             ...grade2,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const getGradesResponse = await sendGetRequest(`/grade/latest/${signUpResponse1.body.data}`);
//         assert.strictEqual(getGradesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful three latest grades retrieval.');
//         assert.strictEqual(getGradesResponse.body.data.length, 2, 'Expected the number of retrieved grades to be 2.');
//     });

//     test('getThreeLatestGrades() - validation error', async () => {
//         const getGradesResponse = await sendGetRequest(`/grade/latest/${invalidIdUrl}`);
//         assert.strictEqual(getGradesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
//         assert.strictEqual(getGradesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
//     });

//     test('getThreeLatestGrades() - student does not exist', async () => {
//         const getGradesResponse = await sendGetRequest(`/grade/latest/${nonExistentId}`);
//         assert.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
//     });

//     test('updateGrade() - success', async () => {
//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/teacher', teacher1);
//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const updateGradeResponse = await sendPatchRequest(
//             `/grade/${createGradeResponse.body.data.id}`,
//             {
//                 description: grade2.description,
//                 grade: grade2.grade,
//                 weight: grade2.weight

//             }
//         );
//         assert.strictEqual(updateGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade update.');
//         assert.strictEqual(updateGradeResponse.body.data.description, grade2.description, `Expected the updated description to be "${grade2.description}".`);
//         assert.strictEqual(updateGradeResponse.body.data.grade, grade2.grade, `Expected the updated grade to be "${grade2.grade}".`);
//         assert.strictEqual(updateGradeResponse.body.data.weight, grade2.weight, `Expected the updated weight to be "${grade2.weight}".`);
//     });

//     test('updateGrade() - validation error', async () => {
//         const updateGradeResponse = await sendPatchRequest(`/grade/${invalidIdUrl}`, {
//             description: emptyString,
//             grade: 0,
//             weight: 0

//         });
//         assert.strictEqual(updateGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
//         assert.strictEqual(updateGradeResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
//     });

//     test('updateGrade() - grade does not exist', async () => {
//         const updateGradeResponse = await sendPatchRequest(
//             `/grade/${nonExistentId}`,
//             {
//                 description: grade2.description,
//                 grade: grade2.grade,
//                 weight: grade2.weight
//             }
//         );
//         assert.strictEqual(updateGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
//     });

//     test('deleteGrade() - success', async () => {
//         const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
//         assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');

//         const signUpResponse2 = await sendPostRequest('/auth/signup/teacher', teacher1);
//         assert.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');

//         const createSubjectResponse = await sendPostRequest('/subject', subject1);
//         assert.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');

//         const createGradeResponse = await sendPostRequest('/grade', {
//             ...grade1,
//             studentId: signUpResponse1.body.data,
//             subjectId: createSubjectResponse.body.data.id,
//             teacherId: signUpResponse2.body.data,
//         });
//         assert.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');

//         const deleteGradeResponse = await sendDeleteRequest(`/grade/${createGradeResponse.body.data.id}`);
//         assert.strictEqual(deleteGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade deletion.');
//         assert.strictEqual(deleteGradeResponse.body.data.id, createGradeResponse.body.data.id, 'Expected the deleted grade ID to match the created grade ID.');
//     });

//     test('deleteGrade() - validation error', async () => {
//         const deleteGradeResponse = await sendDeleteRequest(`/grade/${invalidIdUrl}`);
//         assert.strictEqual(deleteGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
//         assert.strictEqual(deleteGradeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
//     });

//     test('deleteGrade() - grade does not exist', async () => {
//         const deleteGradeResponse = await sendDeleteRequest(`/grade/${nonExistentId}`);
//         assert.strictEqual(deleteGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
//     });
// });