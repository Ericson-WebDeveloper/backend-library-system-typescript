import {Router} from 'express';
import { LoanDashBoardDataUser } from '../controller/LoanController';
import { dashBoardDatas, SearchUsers, ListUsers, UpdatingProfileData, 
UpdatingProfileVatar, RegisterNewUser, fetchUser, UpdatingWarning } from '../controller/UserController';
import { profileUpdateValidate, AvatarValidate, registerNewUserValidation } from '../helper/Validation';
import { handleErrors } from '../helper/Validator-Error';
import { protect } from '../middleware/authmiddleware';
import { roleprotect } from '../middleware/roleMiddleware';
const router = Router();

router.get('/dashboard-datas', protect, roleprotect(['Librarian']), dashBoardDatas);
router.get('/dashboard-datas/user/:id_user', protect, roleprotect(['User']), LoanDashBoardDataUser);
router.post(`/user-search/details`, protect, roleprotect(['Librarian']), SearchUsers);
router.post(`/user/register`, protect, roleprotect(['Librarian']), registerNewUserValidation, handleErrors, RegisterNewUser);
router.get(`/user-list`, protect, roleprotect(['Librarian']), ListUsers);
router.put(`/profile-update`, protect, roleprotect(['Librarian', 'User']), profileUpdateValidate, handleErrors, UpdatingProfileData);
router.put(`/profile-update/avatar`, protect, roleprotect(['Librarian', 'User']), UpdatingProfileVatar);
router.get('/user-details/:user_id', protect, roleprotect(['Librarian']), fetchUser);
router.put('/user-warning/reset/:id_user', protect, roleprotect(['Librarian']), UpdatingWarning);

// register new user by librarian -> auto generate password send to email the account details


export default router;