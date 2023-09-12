import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import bookRouter from './routes/book';
import loanRouter from './routes/loan';
import cookieParser from 'cookie-parser'
import { ApiRouteNotFound, errorHandler } from './middleware/errorMiddleware';

export const appServer = (server: Express) => {
    server.use(express.json({limit: '50mb'}));
    server.use(express.urlencoded({extended:false}));

    const whitelist = ["http://localhost:3000"];

    const corsAsync = (req: Request, callback: (params1:null, params2: cors.CorsOptions) => void ) => {
        let corsOptions = { origin: false };
        const origin = req.header('Origin');
        if (!origin || whitelist.indexOf(origin) !== -1) {
            corsOptions = { origin: true };
        }
        callback(null, { ...corsOptions, credentials: true, optionsSuccessStatus: 200});
    }

    server.use(cors(corsAsync));
    server.use(cookieParser());

    server.use('/api/library-system/backend', authRouter);
    server.use('/api/library-system/backend/admin', userRouter);
    server.use('/api/library-system/backend/admin/book', bookRouter);
    server.use('/api/library-system/backend/loan', loanRouter);

    // test porpose
    server.get("/api/test-route", (req: Request, res: Response) => {
        return res.status(200).json({message: ' Helloe '})
    });
    // test porpose

    server.get('/api/*', ApiRouteNotFound);
    server.get('/*', ApiRouteNotFound);
    server.use(errorHandler);
    return server;
}