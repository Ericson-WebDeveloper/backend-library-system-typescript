import {validationResult} from 'express-validator';
import {Request, Response, NextFunction} from 'express'

export const handleErrors = (req: Request, res: Response, next: NextFunction) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    next();
}