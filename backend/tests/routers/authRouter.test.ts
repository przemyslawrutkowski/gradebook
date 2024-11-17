import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import { sendPostRequest } from '../../src/utils/requestHelpers';
import { comparePasswords } from '../../src/modules/auth';
import { administrator1, emptyString, nonExistentPassword, nonExistentEmail, newPassword } from '../../src/utils/testData';
import { validate as uuidValidate } from 'uuid';

suite('authRouter', () => {
    afterEach(async () => {
        await prisma.administrators.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.parents.deleteMany();
        await prisma.students.deleteMany();
    });

    test('signIn() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: administrator1.password
        });
        assert.strictEqual(signInResponse.statusCode, 200, 'Expected the status code to be 200 for a successful sign-in.');
        assert.strictEqual(signInResponse.body.data.id, signUpResponse.body.data, 'Expected the signed-in user ID to match the signed-up user ID.');
    });

    test('signIn() - validation error', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: emptyString,
            password: emptyString
        });
        assert.strictEqual(signInResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(signInResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });

    test('signIn() - non-existent email', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: nonExistentEmail,
            password: nonExistentPassword
        });
        assert.strictEqual(signInResponse.statusCode, 404, 'Expected the status code to be 404 for a non-existent email.');
    });

    test('signIn() - incorrect password', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: nonExistentPassword
        });
        assert.strictEqual(signInResponse.statusCode, 401, 'Expected the status code to be 401 for an incorrect password.');
    });

    test('signUp() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        assert.strictEqual(uuidValidate(signUpResponse.body.data), true, 'Expected the response data to be a valid UUID for a successful signup.');
    });

    test('signUp() - validation error', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: emptyString,
            email: emptyString,
            phoneNumber: emptyString,
            password: emptyString,
            passwordConfirm: emptyString,
            firstName: emptyString,
            lastName: emptyString
        });
        assert.strictEqual(signUpResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(signUpResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9.');
    });

    test('signUp() - user already exists', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const signUpResponse2 = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse2.statusCode, 409, 'Expected the status code to be 409 for a user that already exists.');
    });

    test('forgotPassword() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: administrator1.email
        });
        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for successfully sending a password reset email.');

        const updatedUser = await prisma.administrators.findUnique({
            where: {
                email: administrator1.email
            }
        });
        assert.notStrictEqual(updatedUser, null, 'Expected the user to be found.');
        assert.notStrictEqual(updatedUser!.reset_password_token, null, 'Expected the reset password token to be set.');
        assert.notStrictEqual(updatedUser!.reset_password_expires, null, 'Expected the reset password expiry date to be set.');
    });

    test('forgotPassword() - validation error', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: emptyString
        });
        assert.strictEqual(forgotPasswordResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        assert.strictEqual(forgotPasswordResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });

    test('forgotPassword() - non-existent email', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: nonExistentEmail
        });
        assert.strictEqual(forgotPasswordResponse.statusCode, 404, 'Expected the status code to be 404 for a non-existent email.');
    });

    test('resetPassword() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);
        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: administrator1.email
        });
        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for successfully sending a password reset email.');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: administrator1.password,
        });

        const resetPasswordResponse = await sendPostRequest('/auth/reset-password', { password: newPassword }, signInResponse.body.data.jwt);
        assert.strictEqual(resetPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for a successful password reset.');
        assert.strictEqual(await comparePasswords(newPassword, resetPasswordResponse.body.data.password), true, `Expected the new password to be "${newPassword}".`);
    });
});