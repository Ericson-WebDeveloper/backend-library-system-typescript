import {Router, Request, Response} from 'express';
import { RegisterUser, LoginUser, LogOutUser, checkEmailResetPass, processResetPass } from '../controller/UserController';
import { registerValidation, resetPassValidate } from '../helper/Validation';
import { handleErrors } from '../helper/Validator-Error';
import multer from 'multer';
import { imageValidate } from '../middleware/ImageValidate';
import { protect } from '../middleware/authmiddleware';
import { refreshAthorization } from '../middleware/refreshTokenMiddleware';
import Role from '../model/Role';

const upload = multer();
const router = Router();



router.post('/sign-up', upload.none(), registerValidation, handleErrors, RegisterUser);
router.post('/sign-in', LoginUser);
router.get('/user-me', protect, (req: Request, res: Response) => {
                                        // @ts-ignore
    return res.status(200).json({user: req.user});
});
router.get('/role-list', protect, async (req: Request, res: Response) => {
    try {
        let roles = await Role.find();
        return res.status(200).json({message: 'Register Complete', roles});
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Cannot Fetch Role List. Server Error.', error_details:{...error}});
    }
});

router.get('/refresh-authetication', refreshAthorization);
router.post('/logout', protect, LogOutUser);
router.post('/logout-force/backup-route', LogOutUser);// force logout wihtout middleware

// router.get('/user-authenticate', autheticate); // autheticate check if auth_toekn then refresh token if needed. then return user data

router.post('/user/reset-password/request', checkEmailResetPass);
router.post('/user/reset-password/submit', resetPassValidate, handleErrors, processResetPass);


export default router