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
