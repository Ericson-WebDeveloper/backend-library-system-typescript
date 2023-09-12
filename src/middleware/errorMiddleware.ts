import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    return res.status(statusCode).json({
        message: error.message || 'Server is has error encounter. please try again later.',
        stack: process.env.NODE_ENV == "production" ? null : error.stack
    });
}

export const ApiRouteNotFound = (req: Request, res: Response, next: NextFunction) => {
    // next({statusCode: 404, status: 404, message: 'Route not Found'});
    res.status(404);
    throw new Error('Route not Found');
}