import {Request, Response, NextFunction} from 'express';
export const imageValidate = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file);
    next();
}