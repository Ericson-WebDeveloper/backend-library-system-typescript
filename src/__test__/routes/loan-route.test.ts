import * as db from '../db';
import supertest from 'supertest';
import server from '../../server';
import users from '../../config/user.json';
import { createUser } from '../UserSeeder';
import RoleClass from '../../class/RoleClass';
import books from '../../config/book.json';
import { BookModel } from '../../Types/Book';
import BookClass from '../../class/BookClass';
import mongoose from 'mongoose';
import LoanClass from '../../class/LoanClass';
import { LoadModel } from '../../Types/Loan';
import UserClass from '../../class/UserClass';
import { UserModel } from '../../Types/User';
import User from '../../model/User';
import Loan from '../../model/Loan';



import * as sendEmailUtils from '../../helper/Mailer'; // Import the module containing the sendEmail function

// Create a mock function
// const mocksendEmailLoanNotif = jest.fn();


const request = supertest(server);

let bookRef = '';

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

type LoanInterface = Partial<LoadModel>

const loanFakeData: LoanInterface = {
    user: '',
    book: '',
    status: 'not return',
    due_date: new Date(new Date().toLocaleDateString("en-US", {timeZone: 'Asia/Manila'}))
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
    return await User.create(userData);
    // return UserClass.findByEmailUser(user.email);
}

const getUserFake = async (email:string) => {
    return await UserClass.findByEmailUser(email);
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
    await createUser(userData);
    return  userData;
}

const signInUserFake = async (userAdminFake: IUserFake) => {
    return await request.post('/api/library-system/backend/sign-in').send({email: userAdminFake.email, password: userAdminFake.password});
}

const bookFakeAdd = async (book: Omit<BookModel, '_id'|'created_at'>) => {
    return await BookClass.addBook(book)
}

const addLoanFake = async (loan:LoanInterface) => {
    return await Loan.create(loan);
}


beforeAll(async () => {
    await db.connect();
    await db.RoleSeeder();
});

beforeEach(() => {
    // Replace the original sendEmail function with the mock
    // jest.mock('../../helper/Mailer', () => ({
    //     sendEmailLoanNotif: mocksendEmailLoanNotif
    // }));
})
afterEach(async () => {
    await db.clearDatabase();
    await db.RoleSeeder();
    // mocksendEmailLoanNotif.mockClear();

});
afterAll(async () => {
    await db.closeDatabase();
});



describe("Loan Unit Test Routes /api/library-system/backend/loan", () => {

    // describe("POST - Create Borrowed Request - /create-borrowed/request", () => {
    //     test("Create Borrowed Request Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         const res = await request.post('/api/library-system/backend/loan/create-borrowed/request').set('Cookie', resCookie.headers['set-cookie'])
    //         .send(loanFake);
    //         expect(res.status).toBe(200);
    //     });

    //     test("Create Borrowed Request 422", async () => {
    //         let userAdminFake = await createUserAdmin(); 
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         const res = await request.post('/api/library-system/backend/loan/create-borrowed/request').set('Cookie', resCookie.headers['set-cookie'])
    //         .send(loanFake);
    //         expect(res.status).toBe(422);
    //     });

    //     test("Create Borrowed Request Book COpies 0", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[2]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         const res = await request.post('/api/library-system/backend/loan/create-borrowed/request').set('Cookie', resCookie.headers['set-cookie'])
    //         .send(loanFake);
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe("Book Not Available");
    //     });

    //     test("Create Borrowed Request Book User Many Warnings", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount(3);
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         const res = await request.post('/api/library-system/backend/loan/create-borrowed/request').set('Cookie', resCookie.headers['set-cookie'])
    //         .send(loanFake);
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe("This User Has many warning. for the mean time this user are not allowed borrowed");
    //     });
    // });

    // describe("GET - Fetch Loan List - /list", () => {
    //     test("Get All Loan Request Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         await addLoanFake(loanFake);
    //         const res = await request.get('/api/library-system/backend/loan/list').set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //     });

    //     test("Get All Loan Request Success - With Query Params", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/list?user=${userFake.firstname}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loans.data).not.toBeNull();
    //     });

    //     test("Get All Loan Request Success - With Query Params 2", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/list?book=${bookRef.title}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loans.data).not.toBeNull();
    //     });

    //     test("Get All Loan Request Success - With Query Params 2", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/list?book=${bookRef.title}&user=${userFake.firstname}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loans.data).not.toBeNull();
    //     });

    //     test("Get All Loan Request Success - With Query Params Invalid", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/list?book=${`sfdsf`}&user=${`kkk`}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loans.data.length).toBe(0);
    //     });
    // });

    // describe("GET - Fetch Loan - /:id_loan", () => {
    //     test("Get Loan Request Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/${loanRef._id}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loan).not.toBeNull();
    //     });

    //     test("Get Loan Request Success - Invalid ID", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/${new mongoose.Types.ObjectId('1234567890pf')}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.loan).toBeNull();
    //     });

    //     test("Get Loan Request - UnAuthenticated", async () => {
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));       
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/${loanRef._id}`).set('Cookie', '');
    //         expect(res.status).toBe(401);
    //     });
    // });

    // describe("PUT - Update Loan - /update/:id_loan", () => {
    //     test("PUT Update Loan Request Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.put(`/api/library-system/backend/loan/update/${loanRef._id}`).set('Cookie', resCookie.headers['set-cookie'])
    //         .send({_id:loanRef._id});
    //         expect(res.status).toBe(200);
    //     });

    //     test("PUT Update Loan Request - Invalid Data", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.put(`/api/library-system/backend/loan/update/${loanRef._id}`).set('Cookie', resCookie.headers['set-cookie'])
    //         .send({_id: '098765rgdhuje'});
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe('Loan Returning book Failed');
    //     });

    //     test("PUT Update Loan Request - Invalid Loan ID", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.put(`/api/library-system/backend/loan/update/${new mongoose.Types.ObjectId('098765rgdhuj')}`).set('Cookie', resCookie.headers['set-cookie'])
    //         .send({_id: new mongoose.Types.ObjectId('098765rgdhuj')});
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe('Data Not Found');
    //     });
    // });

    describe("PUT - Send Email Notification - /send-email/:id_loan", () => {

        
        test("PUT Send Email Notification Request Success", async () => {
             
            const spysendEmailLoanNotif = jest.spyOn(sendEmailUtils, 'sendEmailLoanNotif');

            let userAdminFake = await createUserAdmin();
            let userFake = await createUserAccount();
            let bookFake = JSON.parse(JSON.stringify(books[0]));
            let bookRef = await bookFakeAdd(bookFake);
            let loanFake = JSON.parse(JSON.stringify(loanFakeData));
            const resCookie = await signInUserFake(userAdminFake);          
            loanFake.book = bookRef;
            loanFake.user = userFake;
            let loanRef = await addLoanFake(loanFake);
            const res = await request.put(`/api/library-system/backend/loan/send-email/${loanRef._id}`).set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(200);

            expect(spysendEmailLoanNotif).toHaveBeenCalled();
            expect(res.body.message).toBe('Email Send Success');
            spysendEmailLoanNotif.mockClear();
        });

        test("PUT Send Email Notification Request - Inavlid Params ID", async () => {
            const spysendEmailLoanNotif = jest.spyOn(sendEmailUtils, 'sendEmailLoanNotif');
            let userAdminFake = await createUserAdmin();
            let userFake = await createUserAccount();
            let bookFake = JSON.parse(JSON.stringify(books[0]));
            let bookRef = await bookFakeAdd(bookFake);
            let loanFake = JSON.parse(JSON.stringify(loanFakeData));
            const resCookie = await signInUserFake(userAdminFake);          
            loanFake.book = bookRef;
            loanFake.user = userFake;
            let loanRef = await addLoanFake(loanFake);
            const res = await request.put(`/api/library-system/backend/loan/send-email/${new mongoose.Types.ObjectId('jnhsgb475jt8')}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(400);
            expect(spysendEmailLoanNotif).not.toHaveBeenCalled();
            expect(res.body.message).toBe('Cannot Find Data. Cannot Send Email Notification');
            spysendEmailLoanNotif.mockClear();
        });

        // test("PUT Send Email Notification Request - Inavlid Params ID", async () => {
        //     // chnage MAILER smtp -> smtps
        //     let userAdminFake = await createUserAdmin();
        //     let userFake = await createUserAccount();
        //     let bookFake = JSON.parse(JSON.stringify(books[0]));
        //     let bookRef = await bookFakeAdd(bookFake);
        //     let loanFake = JSON.parse(JSON.stringify(loanFakeData));
        //     const resCookie = await signInUserFake(userAdminFake);          
        //     loanFake.book = bookRef;
        //     loanFake.user = userFake;
        //     let loanRef = await addLoanFake(loanFake);
        //     const res = await request.put(`/api/library-system/backend/loan/send-email/${loanRef._id}`)
        //     .set('Cookie', resCookie.headers['set-cookie']);
        //     expect(res.status).toBe(400);
        //     expect(res.body.message).toBe('Cannot Send Email Notification. Email Server Error');
        // });
    });

    // describe("GET - FETCH all users loan history - /loans-user/:user_id", () => {
    //     test("GET Fetch Loans Request Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/loans-user/${userFake._id}`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.message).toBe('Loan List By User Request Success');
    //         expect(res.body.loans.data.length).toBeGreaterThan(0);
    //     });

    //     test("GET Fetch Loans Request Success - with Page Query", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         let userFake = await createUserAccount();
    //         let bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bookRef = await bookFakeAdd(bookFake);
    //         let loanFake = JSON.parse(JSON.stringify(loanFakeData));
    //         const resCookie = await signInUserFake(userAdminFake);          
    //         loanFake.book = bookRef;
    //         loanFake.user = userFake;
    //         let loanRef = await addLoanFake(loanFake);
    //         const res = await request.get(`/api/library-system/backend/loan/loans-user/${userFake._id}?page=1`).set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.message).toBe('Loan List By User Request Success');
    //         expect(res.body.loans.data.length).toBeGreaterThan(0);
    //     });
    // });

    describe("GET - FETCH Dashboard Loan Counts - /loan-dashboard/counts", () => {
        test("GET Dashboard Loan Counts Request Success", async () => {
            let userAdminFake = await createUserAdmin();
            let userFake = await createUserAccount();
            let bookFake = JSON.parse(JSON.stringify(books[0]));
            let bookRef = await bookFakeAdd(bookFake);
            let loanFake = JSON.parse(JSON.stringify(loanFakeData));
            const resCookie = await signInUserFake(userAdminFake);          
            loanFake.book = bookRef;
            loanFake.user = userFake;
            let loanRef = await addLoanFake(loanFake);
            const res = await request.get(`/api/library-system/backend/loan/loan-dashboard/counts`).set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(200);
            expect(res.body.loanscount[0]).toHaveProperty('Loan_Count', 1);
            expect(res.body.loanscount[0]).toHaveProperty('Loan_Not_Return', 1);
        });


        test("GET Dashboard Loan Counts Request Success - But no Loan Data", async () => {
            let userAdminFake = await createUserAdmin();
            let bookFake = JSON.parse(JSON.stringify(books[0]));
            const resCookie = await signInUserFake(userAdminFake);          
            const res = await request.get(`/api/library-system/backend/loan/loan-dashboard/counts`).set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(200);
        });
        
    });

});