import jwt from 'jsonwebtoken';
import User from '../model/User'
import fs from 'fs';
import { jwtError } from '../helper/Token-Utils';
import {Request, Response, NextFunction} from 'express'
import { UserModel } from '../Types/User';

export const protect = async(req: Request<{}, {}, {}, {}, {}>, res: Response, next: NextFunction) => {
    let token;
    const {auth_token} = req.cookies;

    if(auth_token) {
        try {
            token = auth_token;
            const publickey = fs.readFileSync('./src/config/public.pem', { encoding: "utf8" } );
            // if(token) {
                let {email} = jwt.verify(token, publickey) as {email: string};

                if(!email) {
                    // res.status(403)
                    // throw new Error(`Token Expired/Invalid Need to Refresh token.`);
                    let response = {message: 'You are unanthenticated.', status: 401};
                    return res.status(response.status).json({message: response.message});
                }

                let user: UserModel = await User.findOne({email: email}).populate({path: 'role'}).select('-password');

                if(!user) {
                    // res.status(401);
                    // throw new Error(`User Not Found.`);
                    return res.status(401).json({message: `User Not Found.`})
                }
                // @ts-ignore
                req.user = user;
                next();
        } catch (err: any) {
            let response = jwtError(err) != null ? jwtError(err) : {message: 'You are unanthenticated.', status: 401, status_code: ''};
            return res.status(response ? response.status! : 401).json({message: response ? response.message : "Authentication Error"
                || 'You are unanthenticated', status_code: response ? response.status_code : 4011});
        }
    } else {
        let response = {message: 'You are unanthenticated.', status: 401, status_code: ''}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});

    }
}
