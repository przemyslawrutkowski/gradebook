import prisma from '../../src/db';
import test, { afterEach, suite } from 'node:test';
import assert from 'node:assert';
import { io as Client } from 'socket.io-client';
import { messageData, student1, student2, teacher1 } from '../../src/utils/testData';
import {
    sendPostRequest,
} from '../../src/utils/requestHelpers';
import { messages } from '@prisma/client';
import { UserType } from '../../src/enums/userTypes';

suite('messagesHandler', () => {
    let clientSocket1: any;
    let clientSocket2: any;

    afterEach(async () => {
        await prisma.messages.deleteMany();
        await prisma.students.deleteMany();
        await prisma.teachers.deleteMany();

        if (clientSocket1) clientSocket1.close();
        if (clientSocket2) clientSocket2.close();
    });

    test('Join room and receive unread messages - success', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2);
        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);

        clientSocket1 = Client(`http://localhost:3000`);
        clientSocket1.emit('join', signUpResponse1.body.data);

        clientSocket1.emit('send_message', {
            ...messageData,
            senderId: signUpResponse1.body.data,
            senderTypeId: UserType.Student,
            receiverId: signUpResponse2.body.data,
            receiverTypeId: UserType.Student
        });

        clientSocket1.emit('send_message', {
            ...messageData,
            senderId: signUpResponse3.body.data,
            senderTypeId: UserType.Teacher,
            receiverId: signUpResponse3.body.data,
            receiverTypeId: UserType.Teacher
        });

        clientSocket2 = Client(`http://localhost:3000`);
        clientSocket2.emit('join', signUpResponse2.body.data);

        await (async () => {
            clientSocket2.on('receive_messages', (messages: messages[]) => {
                assert(Array.isArray(messages), 'Expected messages to be an array.');
                assert.strictEqual(messages.length, 1, 'Expected 1 unread message.');
                assert.strictEqual(messages[0].subject, messageData.subject, `Expected the message subject to be "${messageData.subject}".`);
                assert.strictEqual(messages[0].content, messageData.content, `Expected the message content to be "${messageData.content}".`);
            });
        })();
    });

    test('Send and receive message in real-time', async () => {
        const signUpResponse1 = await sendPostRequest('/auth/signup/student', student1);
        const signUpResponse2 = await sendPostRequest('/auth/signup/student', student2)
        const signUpResponse3 = await sendPostRequest('/auth/signup/teacher', teacher1);

        clientSocket1 = Client(`http://localhost:3000`);
        clientSocket1.emit('join', signUpResponse1.body.data);
        clientSocket2 = Client(`http://localhost:3000`);
        clientSocket2.emit('join', signUpResponse2.body.data);

        await (async () => {
            clientSocket2.on('receive_message', (messages: messages[]) => {
                const msg = messages[0];
                assert.strictEqual(msg.subject, messageData.subject, 'Expected message subject to match.');
                assert.strictEqual(msg.content, messageData.content, 'Expected message content to match.');
                assert.strictEqual(msg.sender_id, signUpResponse1.body.data, 'Expected sender ID to match.');
                assert.strictEqual(msg.receiver_id, signUpResponse2.body.data, 'Expected receiver ID to match.');
            });

            clientSocket1.emit('send_message', {
                ...messageData,
                senderId: signUpResponse1.body.data,
                senderTypeId: UserType.Student,
                receiverId: signUpResponse2.body.data,
                receiverTypeId: UserType.Student
            });

            clientSocket1.emit('send_message', {
                ...messageData,
                senderId: signUpResponse3.body.data,
                senderTypeId: UserType.Teacher,
                receiverId: signUpResponse3.body.data,
                receiverTypeId: UserType.Teacher
            });
        });
    });
});
