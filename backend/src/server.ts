import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import authRouter from './routers/authRouter';
import studentsParentsRouter from './routers/studentsParentsRouter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/auth', authRouter);
app.use('/student-parent', studentsParentsRouter)

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

export default app;