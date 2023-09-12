import {Request, Response} from 'express';

export const removeTokens = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    req.cookies['auth_token'] = '';
    req.cookies['refresh_token'] = '';
}