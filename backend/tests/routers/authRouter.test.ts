import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import {
    sendPostRequest,
    sendGetRequest,
    sendPatchRequest,
    sendDeleteRequest,
} from '../../src/utils/requestHelpers';
import { comparePasswords } from '../../src/modules/auth';

suite('authRouter', () => {
    afterEach(async () => {
        await prisma.administrators.deleteMany();
        await prisma.teachers.deleteMany();
        await prisma.parents.deleteMany();
        await prisma.students.deleteMany();
    });

    test('signIn() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful signup');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: 'administrator@administrator.com',
            password: 'password'
        });

        assert.strictEqual(signInResponse.statusCode, 200, 'Expected status code 200 for successful sign in');
    });

    test('signIn() - validation error', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: '',
            password: ''
        });

        assert.strictEqual(signInResponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(signInResponse.body.errors.length, 2, 'Expected 2 validation errors');
    });

    test('signIn() - invalid email', async () => {
        const signInResponse = await sendPostRequest('/auth/signin', {
            email: 'administrator@administrator.com',
            password: 'password'
        });

        assert.strictEqual(signInResponse.statusCode, 404, 'Expected status code 404 for invalid email');
    });

    test('signIn() - invalid password', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful signup');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: 'administrator@administrator.com',
            password: 'password1'
        });

        assert.strictEqual(signInResponse.statusCode, 401, 'Expected status code 401 for invalid password');
    });

    test('signUp() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful signup');
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

        assert.strictEqual(signUpResponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(signUpResponse.body.errors.length, 9, 'Expected 9 validation errors');
    });

    test('signUp() - user exists', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse1.statusCode, 200, 'Expected status code 200 for successful signup');

        const signUpResponse2 = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse2.statusCode, 409, 'Expected status code 409 for user already exists');
    });

    test('forgotPassword() - success', async () => {
        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful signup');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: 'administrator@administrator.com'
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected status code 200 for successful sending of password reset email');
    });

    test('forgotPassword() - validation error', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: ''
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 400, 'Expected status code 400 for validation error');
        assert.strictEqual(forgotPasswordResponse.body.errors.length, 1, 'Expected 1 validation errors');
    });

    test('forgotPassword() - invalid email', async () => {
        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: 'student@student.com'
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 404, 'Expected status code 404 for invalid email');
    });

    test('resetPassword() - success', async () => {
        const newPassword = 'newpassword';

        const signUpResponse = await sendPostRequest('/auth/signup/administrator', {
            pesel: '11111111111',
            email: 'administrator@administrator.com',
            phoneNumber: '601234567',
            password: 'password',
            passwordConfirm: 'password',
            firstName: 'Administrator',
            lastName: 'Administrator'
        });

        assert.strictEqual(signUpResponse.statusCode, 200, 'Expected status code 200 for successful signup');

        const forgotPasswordResponse = await sendPostRequest('/auth/forgot-password', {
            email: 'administrator@administrator.com'
        });

        assert.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected status code 200 for successful sending of password reset email');

        const signInResponse = await sendPostRequest('/auth/signin', {
            email: 'administrator@administrator.com',
            password: 'password',
        });

        const resetPasswordResponse = await sendPostRequest('/auth/reset-password', {
            password: newPassword
        }, signInResponse.body.data);

        assert.strictEqual(resetPasswordResponse.statusCode, 200, 'Expected status code 200 for successful password reset');
        assert.strictEqual(await comparePasswords(newPassword, resetPasswordResponse.body.data.password), true, 'Expected password to be "newpassword"');
    });
});