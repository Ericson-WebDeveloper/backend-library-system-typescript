import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import multer from 'multer';
import cors from 'cors';
import cookieParser from 'cookie-parser'
// const { connectDb } = require('./config/db');
import { ApiRouteNotFound, errorHandler } from './middleware/errorMiddleware';
import { connectDb } from './config/db';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import bookRouter from './routes/book';
import loanRouter from './routes/loan';
import { appServer } from './app';
dotenv.config();
const app = express();

// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({extended:false}));

// const whitelist = ["http://localhost:3000"];
// const corsAsync = (req: Request, callback: (params1:null, params2: cors.CorsOptions) => void ) => {
//     let corsOptions = { origin: false };
//     const origin = req.header('Origin');
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//         corsOptions = { origin: true };
//     }
//     callback(null, { ...corsOptions, credentials: true, optionsSuccessStatus: 200});
// }

// app.use(cors(corsAsync));
// app.use(cookieParser());

// app.use('/api/library-system/backend', authRouter);
// app.use('/api/library-system/backend/admin', userRouter);
// app.use('/api/library-system/backend/admin/book', bookRouter);
// app.use('/api/library-system/backend/loan', loanRouter);

// app.get('/api/*', ApiRouteNotFound);
// app.get('/*', ApiRouteNotFound);
// app.use(errorHandler);

// const server = http.createServer(app);


const server = http.createServer(appServer(app));

const runApplication = async () => {
  try {
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'DEV' 
      || process.env.NODE_ENV === 'PRODUCTION' || process.env.NODE_ENV === 'production') {
        await connectDb();
      }
      server.listen(process.env.PORT || 5012, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`);
      });
  } catch (error: any) {
      console.log(error?.message);
      console.log(error?.codeName);
      await runApplication();
  }
}

runApplication();
export default server;
