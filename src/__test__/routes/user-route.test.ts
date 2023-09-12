import * as db from '../db';
import supertest from 'supertest';
import server from '../../server';
import users from '../../config/user.json';
import { createUser } from '../UserSeeder';
import RoleClass from '../../class/RoleClass';
import User from '../../model/User';
import { LoadModel } from '../../Types/Loan';
import BookClass from '../../class/BookClass';
import { BookModel } from '../../Types/Book';
import Loan from '../../model/Loan';
import books from '../../config/book.json';
import * as sendEmailUtils from '../../helper/Mailer';
import mongoose from 'mongoose';

const request = supertest(server);

const spysendEmailRegister = jest.spyOn(sendEmailUtils, 'sendEmailRegister');

beforeAll(async () => {
    await db.connect();
    await db.RoleSeeder();
});

beforeEach(() => {

});

afterEach(async () => {
    await db.clearDatabase();
    await db.RoleSeeder();
    spysendEmailRegister.mockClear();
});

afterAll(async () => {
    await db.closeDatabase();
});

type LoanInterface = Partial<LoadModel>

const loanFakeData: LoanInterface = {
    user: '',
    book: '',
    status: 'not return',
    due_date: new Date(new Date().toLocaleDateString("en-US", {timeZone: 'Asia/Manila'}))
}

interface IUserFake {
    _id?: string
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    password: string;
    details: {
        avatar: string;
        phone: string;
    };
    token?: {
        value: string,
        expires: Date
    },
    warning?: Number,
    role: string[];
}

const bookFakeAdd = async (book: Omit<BookModel, '_id'|'created_at'>) => {
    return await BookClass.addBook(book)
}

const addLoanFake = async (loan:LoanInterface) => {
    return await Loan.create(loan);
}

const createUserAccount = async (warnings: number = 0) => {
    let userFake = JSON.parse(JSON.stringify(users[1]));
    let userData: IUserFake = {
        firstname: userFake.firstname,
        lastname: userFake.lastname,
        middlename: userFake.middlename,
        email: userFake.email,
        password: 'Pass@_123',
        details: {
            avatar: userFake.details.avatar,
            phone: userFake.details.phone
        },
        token: {
            value: 'sddsdsds',
            expires: new Date()
        },
        warning: warnings,
        role: [await RoleClass.roleUser() as string]
    }
    let userFakeD = await createUser(userData);;
    // return UserClass.findByEmailUser(user.email);
    userFakeD!.password = 'Pass@_123';
    return userFakeD;
}
const createUserAdmin = async () => {
    let userFake = JSON.parse(JSON.stringify(users[0]));
    let userData: IUserFake = {
        firstname: userFake.firstname,
        lastname: userFake.lastname,
        middlename: userFake.middlename,
        email: userFake.email,
        password: 'Pass@_123',
        details: {
            avatar: userFake.details.avatar,
            phone: userFake.details.phone
        },
        role: [await RoleClass.roleAdmin() as string]
    }
    let userFakeD = await createUser(userData);
    userFakeD!.password = 'Pass@_123';
    return userFakeD;
}

const signInUserFake = async (email: string, password: string) => {
    return await request.post('/api/library-system/backend/sign-in').send({email, password});
}


describe("Test Unit Route auth.ts", () => {
    // describe("GET - Fetch DashBoard Data Librarian /dashboard-datas", () => {
    //     test("GET - Fetch DasBoard Data Success", async () => {
    //         await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/dashboard-datas`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users[0]).toHaveProperty('User_count', 1);
    //         expect(res.body.librarians[0]).toHaveProperty('Librarian_count', 1);
    //     });

    //     test("GET - Fetch DasBoard Data Success - Invalid Role", async () => {
    //         let userAccountFake = await createUserAccount();
    //         await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/dashboard-datas`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(401);
    //     });
    // });

    // describe("GET - Fetch DashBoard Data User /dashboard-datas/user/:id_user", () => {
    //     test("GET - Fetch DasBoard Data Success - W Out Datas", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/dashboard-datas/user/${userAccountFake?._id!}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loancount).toHaveProperty('Loan_Count', 0);
    //         expect(res.body.loancount).toHaveProperty('Loan_Current', 0);
    //     });

    //     test("GET - Fetch DasBoard Data Success - W Datas", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         loanFake.book = bookRef;
    //         loanFake.user = userAccountFake;
    //         await addLoanFake(loanFake);
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/dashboard-datas/user/${userAccountFake?._id!}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loancount).toHaveProperty('Loan_Count', 1);
    //         expect(res.body.loancount).toHaveProperty('Loan_Current', 1);
    //     });

    //     test("GET - Fetch DasBoard Data Success - W Out Datas", async () => {
    //         await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/dashboard-datas/user/${userAdminFake?._id!}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(401);
    //     });
    // });

    // describe("POST - Search User /user-search/details", () => {
    //     test("POST - Search User Success", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.post(`/api/library-system/backend/admin/user-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search: userAccountFake?.firstname});
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.length).toBeGreaterThan(0);
    //     });

    //     test("POST - Search User Success - Invalid Search", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.post(`/api/library-system/backend/admin/user-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search: 'jmhs'});
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.length).toEqual(0);
    //     });

    //     test("POST - Search User Success - Invalid Search", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.post(`/api/library-system/backend/admin/user-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search: 'jmhs'});
    //         expect(res.status).toBe(401);
    //     });

    // });

    // describe("POST - Admin Register New User /user/register", () => {
    //     test("POST - Admin Register New User Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let userFake = JSON.parse(JSON.stringify(users[1]));
    //         let res = await request.post(`/api/library-system/backend/admin//user/register`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: userFake.firstname,
    //             lastname: userFake.lastname,
    //             middlename: userFake.middlename,
    //             email: userFake.email,
    //             password: 'Pass@_123',
    //             avatar: userFake.details.avatar,
    //             phone: userFake.details.phone,
    //             role: [await RoleClass.roleUser() as string]
    //         });
    //         expect(res.status).toBe(200);
    //         expect(spysendEmailRegister).toHaveBeenCalled();
    //         expect(res.body.message).toBe('Register User Complete');
    //     });

    //     test("POST - Admin Register New User - 422", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let userFake = JSON.parse(JSON.stringify(users[1]));
    //         let res = await request.post(`/api/library-system/backend/admin//user/register`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: userFake.firstname,
    //             email: userFake.email,
    //             password: 'Pass@_123',
    //             avatar: userFake.details.avatar,
    //             phone: userFake.details.phone,
    //             role: [await RoleClass.roleUser() as string]
    //         });
    //         expect(res.status).toBe(422);
    //         expect(spysendEmailRegister).not.toHaveBeenCalled();
    //     });

    //     test("POST - Admin Register New User - Email Exist", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let userFake = JSON.parse(JSON.stringify(users[1]));
    //         let res = await request.post(`/api/library-system/backend/admin//user/register`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: userFake.firstname,
    //             lastname: userFake.lastname,
    //             middlename: userFake.middlename,
    //             email: userAdminFake!.email,
    //             password: 'Pass@_123',
    //             avatar: userFake.details.avatar,
    //             phone: userFake.details.phone,
    //             role: [await RoleClass.roleUser() as string]
    //         });
    //         expect(res.status).toBe(400);
    //         expect(spysendEmailRegister).not.toHaveBeenCalled();
    //         expect(res.body.message).toBe('Email is already use. please use different email.');
    //     });
    // });

    // describe("GET - Fetch All Users /user-list", () => {
    //     test("GET - Fetch All Users Success", async () => {
    //         await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-list`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.data.length).toBeGreaterThanOrEqual(1);
    //     });

    //     test("GET - Fetch All Users Success - No Users", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-list`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.data.length).toEqual(0);
    //     });

    //     test("GET - Fetch All Users Success - With Query Params EMail", async () => {
    //         let userFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-list?email=${userFake?.email}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.data.length).toBeGreaterThanOrEqual(1);
    //     });

    //     test("GET - Fetch All Users Success - With Query Params FullName", async () => {
    //         let userFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-list?fullname=${userFake?.firstname}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.data.length).toBeGreaterThanOrEqual(1);
    //     });

    //     test("GET - Fetch All Users Success - With Query Params Invalid", async () => {
    //         let userFake = await createUserAccount();
    //         let userAdminFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-list?fullname=jnsm`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.users.data.length).toEqual(0);
    //     });

    // });

    // describe("PUT - Updating Profile Data /profile-update", () => {
    //     test("PUT - Updating Profile Data Success", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: 'Ericson', lastname: 'Limpasan', middlename: 'Mamad', 
    //             phone: userAccountFake?.details.phone, 
    //             email: userAccountFake?.email!
    //         });
    //         expect(res.status).toBe(200);
    //     });

    //     test("PUT - Updating Profile Data - 422", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: 'Ericson', lastname: '', middlename: '', 
    //             phone: userAccountFake?.details.phone, 
    //             email: userAccountFake?.email!
    //         });
    //         expect(res.status).toBe(422);
    //     });

    //     test("PUT - Updating Profile Data - UnAuthenticated", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update`)
    //         .set('Cookie', '').send({
    //             firstname: 'Ericson', lastname: 'Limpasan', middlename: 'Mamad', 
    //             phone: userAccountFake?.details.phone, 
    //             email: userAccountFake?.email!
    //         });
    //         expect(res.status).toBe(401);
    //     });

    //     test("PUT - Updating Profile Data Success - Admin Account", async () => {
    //         let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: 'Ericson', lastname: 'Limpasan', middlename: 'Mamad', 
    //             phone: userAccountFake?.details.phone, 
    //             email: userAccountFake?.email!
    //         });
    //         expect(res.status).toBe(200);
    //     });

    //     test("PUT - Updating Profile Data - 422 - Admin Account", async () => {
    //         let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             firstname: 'Ericson', lastname: '', middlename: '', 
    //             phone: userAccountFake?.details.phone, 
    //             email: userAccountFake?.email!
    //         });
    //         expect(res.status).toBe(422);
    //     });

    // });


    // describe("PUT - Updating Profile Data /profile-update/avatar", () => {
    //     test("PUT - Updating Profile Data Success", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update/avatar`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             avatar: users[0].details.avatar
    //         });
    //         expect(res.status).toBe(200);
    //     });

    //     test("PUT - Updating Profile Data Success - W Admin", async () => {
    //         let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update/avatar`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             avatar: users[1].details.avatar
    //         });
    //         expect(res.status).toBe(200);
    //     });

    //     test("PUT - Updating Profile Data - 400", async () => {
    //         let userAccountFake = await createUserAccount();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update/avatar`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             avatar: ''
    //         });
    //         expect(res.status).toBe(400);
    //     });

    //     test("PUT - Updating Profile Data - 400 - W Admin", async () => {
    //         let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.put(`/api/library-system/backend/admin/profile-update/avatar`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({
    //             avatar: ''
    //         });
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe('The Avatar are invalid format');
    //     });
    // });

    // describe("GET - Fetch User Details /user-details/:user_id", () => {
    //     test("GET - Updating Profile Data Success", async () => {
    //          await createUserAccount();
    //          let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-details/${userAccountFake?._id}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //     });

    //     test("GET - Updating Profile Data - Invalid ID", async () => {
    //         await createUserAccount();
    //         let userAccountFake = await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-details/${new mongoose.Types.ObjectId('09jns6gr7h3e')}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.user).toBeNull();
    //    });

    //     test("GET - Updating Profile Data - 401", async () => {
    //         let userAccountFake = await createUserAccount();
    //         await createUserAdmin();
    //         let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
    //         let res = await request.get(`/api/library-system/backend/admin/user-details/${userAccountFake?._id}`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(401);
    //     });
    // });

    describe("PUT - Update User Warnings Details /user-warning/reset/:id_user", () => {
        test("PUT - Update User Warnings Details Success", async () => {
            let userAccountFake = await createUserAccount();
            let userAdminFake = await createUserAdmin();
            let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
            let res = await request.put(`/api/library-system/backend/admin/user-warning/reset/${userAccountFake?._id}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(200);
        });

        test("PUT - Update User Warnings Details - Invalid Role", async () => {
            let userAccountFake = await createUserAccount();
            let userAdminFake = await createUserAdmin();
            let resCookie = await signInUserFake(userAccountFake?.email!, userAccountFake?.password!);
            let res = await request.put(`/api/library-system/backend/admin/user-warning/reset/${userAccountFake?._id}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(401);
        });

        test("PUT - Update User Warnings Details - Invalid ID ", async () => {
            let userAccountFake = await createUserAccount();
            let userAdminFake = await createUserAdmin();
            let resCookie = await signInUserFake(userAdminFake?.email!, userAdminFake?.password!);
            let res = await request.put(`/api/library-system/backend/admin/user-warning/reset/${new mongoose.Types.ObjectId('9jns6ge634hm')}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User Warning Details Update Failed.');
        });
    });

});