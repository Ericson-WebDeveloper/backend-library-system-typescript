import {Request, Response, NextFunction} from 'express'
import { UserModel } from '../Types/User';
import { RoleModel } from '../Types/Role';

export const roleprotect = (roles: Array<string>) => async (req: Request<{}, {}, {}, {}, {}>, res: Response, next: NextFunction) => {
    try {
        let canProceed = false;
        if(!roles || roles.length <= 0) {
            return next();
        }

        // @ts-ignore
        if(!req.user) {
            let response = {message: 'You are unathenticated.', status: 401}; 
            return res.status(response.status).json({message: response.message});
        }
                    // @ts-ignore
        const {user} = req; 

        canProceed = user?.role?.find((role: RoleModel) => {
            return roles.includes(role.name);
        });

        if(canProceed) {
            return next();
        } 

        let response = {message: 'You are unauthorized.', status: 401, status_code: 4011}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});

    } catch (error) {
        let response = {message: 'You are unauthorized.', status: 401, status_code: 4011}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});
    }
}