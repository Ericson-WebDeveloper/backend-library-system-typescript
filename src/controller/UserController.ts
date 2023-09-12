import UserClass from '../class/UserClass';
import RoleClass from '../class/RoleClass';
import { base64_encode_image } from '../helper/ImageToBase64';
import { hashPass, comparePass, generateToken, generateRefreshToken } from '../helper/IndexHelper';
import { removeTokens } from '../helper/AuthHelper';
import isBase64 from 'is-base64';
import { sendEmailRegister, sendEmailResetLink } from '../helper/Mailer';
import mongoose from 'mongoose';
import { generateTokenResetPass } from '../helper/Token-Utils';
import { calDiffISODate } from '../helper/DateTime';
import {Request, Response, NextFunction} from 'express'
import { UserModel } from '../Types/User';

export const RegisterUser = async (req: Request, res: Response) => {
    try {
        
        const role: string|null = !req?.body?.role ? await RoleClass.roleUser() : req.body.role;
        if(!role) {
            return res.status(400).json({message: 'Server encounter error. please try again later.'});
        }
        if(await UserClass.findByEmailUser(req.body.email)) {
            return res.status(400).json({message: 'Email is already use. please use different email.'});
        }
        const data: Omit<UserModel, '_id'|'token'|'created_at'|'updated_at'|'warning'> = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            email: req.body.email,
            password: await hashPass(req.body.password),
            details: {
               avatar: req.body.avatar,
               phone: req.body.phone, 
            },
            role: [role]
        }
        let response = await UserClass.register(data);
        if(!response) {
            return res.status(400).json({message: 'Register Failed'});
        }
        return res.status(200).json({message: 'Register Complete'});
    } catch (error: any) {
        return res.status(500).json({message: 'Registration Failed. Server Error.', error_details:{...error}});
    }
}


export const checkEmailResetPass = async(req: Request<{},{},{email:string},{},{}>, res: Response) => {
    try {
        const {email} = req.body;
        let userResponse = await UserClass.findByEmailUser(email);

        if(userResponse) {
            // create token for front end validation
            let tokenvalue = generateTokenResetPass(20);
            // push token value  }
            let response = await UserClass.createToken(userResponse._id, tokenvalue);
            if(!response) {
                return res.status(400).json({message: 'Request Failed. Data Not Found'});
            }
            let link = `http://localhost:3000/reset-password/${response.email}/${tokenvalue}`
            let senEmail = await sendEmailResetLink(response.email, 'librarysystem@gmail.com', "Password Reset Link", response, link);

            return res.status(200).json({message: 'Request Success. Link was send in your email.'});
        }

        return res.status(400).json({message: 'Request Failed Email Invalid. Try Again.'});
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Reset Password request Failed. Server Error.', error_details:{...error}});
    }
}


export const processResetPass = async(req: Request<{}, {}, {email: string, token: string, password: string}, {}, {}>, res: Response) => {
    try {

        const {email, token, password} = req.body;
        let userResponse = await UserClass.findByEmailUser(email);
        if(!userResponse) {
            return res.status(400).json({message: 'Invalid email.'});
        }

        if(!userResponse?.token?.value) {
            return res.status(400).json({message: 'No Token Generate for this request.'});
        }

        if(userResponse.token.value != token) {
            return res.status(400).json({message: 'Token Invalid.'});
        }
        let date = new Date();
        // let start =  date.toISOString('en-Us', {timeZone: 'Asia/Manila'});
        let start = new Date(date.toLocaleDateString('en-Us', {timeZone: 'Asia/Manila'}));
        let end = userResponse.token.expires;
        let {minutes} = calDiffISODate(start, end!);
        if(minutes >= 5) {
            await UserClass.revokeToken(userResponse._id);
            return res.status(400).json({message: 'Token Expires. sorry you can request again.'});
        }

        let newPass = await hashPass(password);
        const data = {
            password: newPass
        }
        let response = await UserClass.updateProfile(userResponse._id, data);

        if(response) {
            await UserClass.revokeToken(userResponse._id);
            return res.status(200).json({message: 'Password Reset Complete. You can login now.'});
        }
        
        return res.status(400).json({message: 'Request Failed Email Invalid. Try Again.'});
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Reset Password request Failed. Server Error.', error_details:{...error}});
    }
}


export const RegisterNewUser = async (req: Request, res: Response) => {
    try {
        // const session = mongoose.startSession()
        if(await UserClass.findByEmailUser(req.body.email)) {
            return res.status(400).json({message: 'Email is already use. please use different email.'});
        }
        const data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            email: req.body.email,
            password: await hashPass(req.body.password),
            details: {
               avatar: req.body.avatar,
               phone: req.body.phone, 
            },
            role: [req.body.role]
        }
        let response = await UserClass.register(data);

        if(!response) {
            return res.status(400).json({message: 'Register Failed'});
        }
     
        let sendemail = await sendEmailRegister(req.body.email, 'librarysystem@gmail.com', 'User Registration', response, req.body.password);

        if(!sendemail) {
            await UserClass.userRollback(response._id);
            return res.status(400).json({message: 'Register Failed. Server Email Send Error.'});
        }

        return res.status(200).json({message: 'Register User Complete'});
    } catch (error: any) {
        return res.status(500).json({message: 'Registration Failed. Server Error.', error_details:{...error}});
    }
}


export const LoginUser = async (req: Request<{}, {}, {email: string, password: string}, {}, {}>, res: Response) => {
    try {
        const user = await UserClass.findByEmailUserAuth(req.body.email);

        if(!user) {
            return res.status(400).json({message: 'Invalid email/password credentials.'});
        }
        if(!await comparePass(req.body.password, user.password)) {
            return res.status(400).json({message: 'Invalid your password/email credentials.'});
        }
        const token = generateToken(user.email); // token expires will use for refresh token or validate the error
        const refreshtoken = generateRefreshToken(user.email);
        user.password = '';
         
        // let date = new Date().toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
        let date = new Date();
        return  res.status(200)
                .cookie('auth_token', token, {
                    // expires: new Date(Date.now() + (1000 * 60 * 60 * 1)), // 1h hr automatic in browser delete when expired
                    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    // path: '/',
                    // sameSite: 'None'
                    sameSite: 'lax'
                })
                .cookie('refresh_token', refreshtoken, {
                    // maxAge: '1d', // 1d automatic in browser delete when expired -> 3hrs
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    // path: '/',
                    sameSite: 'lax'
                    // sameSite: 'None'
                })
                .json({message: 'Sign In Success.', user});

    } catch (error: any) {
        // console.log(error);
        return res.status(500).json({message: 'Sign In Failed. Server Error.', error_details:{...error}});
        // throw new Error('Sign In Failed. Server Error.');
    }
}

export const LogOutUser = (req: Request, res: Response) => {
    try {
        removeTokens(req, res)
        return res.status(200).json({message: 'Logout Complete'});
    } catch (error: any) {
        removeTokens(req, res);
        return res.status(500).json({message: 'Logout Failed. Server Error.', error_details:error});
        // throw new Error('Logout Failed. Server Error.');
    }
}


export const dashBoardDatas = async (req: Request, res: Response) => {
    try {
        let users = await UserClass.getAllUsers('User');
        let librarians = await UserClass.getAllUsers('Librarian');
        return res.status(200).json({message: 'Request Complete', users, librarians});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: error});
    }
}


// export const autheticate = (req, res) => {

// }

export const SearchUsers = async (req: Request<{}, {}, {search:string}, {}, {}>, res: Response) => {
    try {
        const {search} = req.body;
        let users = await UserClass.userSearching(search, 'User');
        return res.status(200).json({message: 'User Search Complete', users});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: error});
    }
}

export const fetchUser = async(req: Request<{user_id:string}, {}, {}, {}, {}>, res: Response) => {
    const {user_id} = req.params;
    try {
        let user = await UserClass.userFindById(user_id);
        return res.status(200).json({message: 'User Fetch Complete', user});
    } catch (error: any) {
        return res.status(500).json({message: 'Server Error.', error_details: {...error}});
    }
    
}

export const ListUsers = async (req: Request<{}, {}, {}, {page:string, fullname: string, email: string}, {}>, res: Response) => {
    try {
        let pageNumber = parseInt(req?.query?.page || '') || 1;
        const searchInput = {
            fullname: req?.query?.fullname || '',
            email: req?.query?.email || '',
        }

        let limit = 2;
        let users = await UserClass.users(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'User List Request Complete', users});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: {...error}});
    }
}


export const UpdatingProfileData = async (req: Request<{}, {}, {firstname: string, lastname: string, middlename: string, 
    email: string, phone: string, password: string}, {}, {}>, res: Response) => {
    try {
        // @ts-ignore
        const {_id} = req.user;
        // if(req.body.password || req.body.password !== '') {

        // }
        const {firstname, lastname, middlename, email, phone, password} = req.body;
        const datas: Omit<UserModel, '_id'| 'role' | 'token' | 'warning' | 'created_at' | 'updated_at'> = {
            firstname, 
            lastname, 
            middlename, 
            email, 
            // password: password == '' ? 'password' : await hashPass(password),
                                                                // @ts-ignore 
            ...(password ? {password: await hashPass(password)} : req.user.password),
            details: {
                phone,
                // @ts-ignore
                avatar: req.user.details.avatar as string
            }
        }
        let userResponse = await UserClass.updateProfile(_id, datas);
        if(userResponse) {
            // let user = await UserClass.userFindById(_id);
            return res.status(200).json({message: 'Profile Update Success', user: userResponse});
        }
        return res.status(400).json({message: 'Profile Update Failed.Please Try Again'});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Profile Update Failed. Server Error.', error_details: {...error}});
    }
}


export const UpdatingProfileVatar = async (req: Request<{}, {}, {avatar: string}, {}, {}>, res: Response) => {
    try {
                            // @ts-ignore
        const {_id, email} = req.user;
        const {avatar} = req.body;
        if(!isBase64(avatar, {mimeRequired: true})) {
            return res.status(400).json({message: 'The Avatar are invalid format'});
        }

        let response = await UserClass.updateProfileAvatar(_id, avatar);
        if(!response) {
            return res.status(400).json({message: 'Profile Avatar Update Failed.'});
        }
        let user = await UserClass.findByEmailUser(email);
        return res.status(200).json({message: 'Profile Update Avatar Complete', user});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Profile Update Failed. Server Error.', error_details: {...error}});
    }
}

export const UpdatingWarning = async (req: Request<{id_user: string}, {}, {}, {}, {}>, res: Response) => {
    try {
        const {id_user} = req.params;
        let user = await UserClass.userResetWarning(id_user);
        if(!user) {
            return res.status(400).json({message: 'User Warning Details Update Failed.'});
        }
        user = await UserClass.findByEmailUser(user.email);
        return res.status(200).json({message: 'User Warning Details Update Complete', user});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'User Warning Details Failed. Server Error.', error_details: {...error}});
    }
}
