import express from 'express';
import cors from 'cors';
import http from 'http';
import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import authRouter from './routers/authRouter';
import studentsParentsRouter from './routers/studentsParentsRouter';
import classesRouter from './routers/classesRouter';
import studentsRouter from './routers/studentsRouter';
import lessonsRouter from './routers/lessonsRouter';
import subjectsRouter from './routers/subjectsRouter';
import attendancesRouter from './routers/attendancesRouter';
import userTypesRouter from './routers/userTypesRouter';
import schoolYearsRouter from './routers/schoolYearsRouter';
import semestersRouter from './routers/semestersRouter';
import gradesRouter from './routers/gradesRouter';
import classNamesRouter from './routers/classNamesRouter';
import { messagesHandler } from './handlers/messages';
import parentsRouter from './routers/parentsRouter';
import teachersRouter from './routers/teachersRouter';
import messagesRouter from './routers/messagesRouter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ["GET", "POST"],
}));

app.use('/auth', authRouter);
app.use('/student-parent', studentsParentsRouter);
app.use('/class', classesRouter);
app.use('/student', studentsRouter);
app.use('/parent', parentsRouter);
app.use('/lesson', lessonsRouter);
app.use('/subject', subjectsRouter);
app.use('/attendance', attendancesRouter);
app.use('/user-type', userTypesRouter);
app.use('/school-year', schoolYearsRouter);
app.use('/semester', semestersRouter);
app.use('/grade', gradesRouter);
app.use('/teacher', teachersRouter);
app.use('/class-name', classNamesRouter)
app.use('/message', messagesRouter);

io.on('connection', (socket) => {
    messagesHandler(io, socket);
});

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

export { app, server };