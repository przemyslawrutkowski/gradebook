import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest
} from '../../src/utils/requestHelpers';
import { comparePasswords } from '../../src/modules/auth';
import { administrator1 } from '../../src/utils/testData';

suite('authRouter', () => {
    afterEach(async () => {
        await prisma.administrators.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.parents.deleteMany();
        await prisma.students.deleteMany();
    });

    test('signIn() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful signup');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: administrator1.password
        });

        assert.strictEqual(signInResponse.statusCode, 200, 'Expected the status code to be 200 for the successful sign in');
    });

    test('signIn() - validation error', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: '',
            password: ''
        });

        assert.strictEqual(signInResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(signInResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2');
    });

    test('signIn() - invalid email', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: administrator1.password
        });

        assert.strictEqual(signInResponse.statusCode, 404, 'Expected the status code to be 404 for the invalid email');
    });

    test('signIn() - invalid password', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful signup');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: 'wrongpassword'
        });

        assert.strictEqual(signInResponse.statusCode, 401, 'Expected the status code to be 401 for the invalid password');
    });

    test('signUp() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful signup');
    });

    test('signUp() - validation error', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '',
            email: '',
            phoneNumber: '',
            password: 'a',
            passwordConfirm: 'b',
            firstName: '1',
            lastName: '1'
        });

        assert.strictEqual(signUpResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(signUpResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9');
    });

    test('signUp() - user exists', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for the successful signup');

        const signUpResponse2 = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse2.statusCode, 409, 'Expected the status code to be 409 for the user already exists');
    });

    test('forgotPassword() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful signup');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: administrator1.email
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for the successful sending of password reset email');
    });

    test('forgotPassword() - validation error', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: ''
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 400, 'Expected the status code to be 400 for the validation error');
        assert.strictEqual(forgotPasswordResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1');
    });

    test('forgotPassword() - invalid email', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: 'invalidemail@student.com'
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 404, 'Expected the status code to be 404 for the invalid email');
    });

    test('resetPassword() - success', async () => {
        const newPassword = 'newpassword';

        const signUpResponse = await sendPostRequest('/auth/signup/administrator', administrator1);

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for the successful signup');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: administrator1.email
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for the successful sending of password reset email');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: administrator1.email,
            password: administrator1.password,
        });

        const resetPasswordResponse = await sendPostRequest('/auth/reset-password', {
            password: newPassword
        }, signInResponse.body.data);

        assert.strictEqual(resetPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for the successful password reset');
        assert.strictEqual(await comparePasswords(newPassword, resetPasswordResponse.body.data.password), true, 'Expected the password to be "newpassword"');
    });
});