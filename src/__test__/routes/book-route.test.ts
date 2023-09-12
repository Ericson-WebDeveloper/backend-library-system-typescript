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

const request = supertest(server);

beforeAll(async () => {
    await db.connect();
    await db.RoleSeeder();
});
afterEach(async () => {
    await db.clearDatabase();
    await db.RoleSeeder();
});
afterAll(async () => {
    await db.closeDatabase();
});

interface IUserFake {
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    password: string;
    details: {
        avatar: string;
        phone: string;
    };
    role: string[];
}

const createUserAccount = async () => {
    let userFake = JSON.parse(JSON.stringify(users[1]));
    let userData: IUserFake = {
        firstname: userFake.firstname,
        lastname: userFake.lastname,
        middlename: userFake.middlename,
        email: userFake.email,
        password: userFake.password,
        details: {
            avatar: userFake.details.avatar,
            phone: userFake.details.phone
        },
        role: [await RoleClass.roleUser() as string]
    }
    await createUser(userData);
    return userData
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

describe("Book Unit Test Routes /api/library-system/backend/admin/book", () => {

    // describe("POST - Add New Book - /add-new", () => {
    //     test("Add New Book Librarian Success", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const BookFake: Omit<BookModel, '_id'|'created_at'> = bookFake;
    //         const res = await request.post('/api/library-system/backend/admin/book/add-new').set('Cookie', cookies).send(BookFake);
    //         expect(res.status).toBe(200);
    //     });

    //     test("Add New Book Librarian - Not Authenticated", async () => {
    //         const res = await request.post('/api/library-system/backend/admin/book/add-new').set('Cookie', '').send();
    //         expect(res.status).toBe(401);
    //     });

    //     test("Add New Book Librarian 422", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.post('/api/library-system/backend/admin/book/add-new').set('Cookie', cookies).send();
    //         expect(res.status).toBe(422);
    //     });
    // });

    // describe("GET - All Books - /all-books", () => {
    //     test("Fetch All Books Success - User", async () => {
    //         const booksFake = JSON.parse(JSON.stringify(books));
    //         booksFake.forEach(async(book:Omit<BookModel, '_id'|'created_at'>) => {
    //             await bookFakeAdd(book)
    //         });
    //         let userAdminFake = await createUserAccount();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.get('/api/library-system/backend/admin/book/all-books').set('Cookie', cookies);
    //         expect(res.status).toBe(200);
    //         expect(res.body.books.data.length).toBeGreaterThan(1);
    //     });

    //     test("Fetch All Books Success - Librarian", async () => {
    //         const booksFake = JSON.parse(JSON.stringify(books));
    //         booksFake.forEach(async(book:Omit<BookModel, '_id'|'created_at'>) => {
    //             await bookFakeAdd(book)
    //         });
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.get('/api/library-system/backend/admin/book/all-books').set('Cookie', cookies);
    //         expect(res.status).toBe(200);
    //         expect(res.body.books.data.length).toBeGreaterThan(1);
    //     });

    //     test("All Books Fetch as Librarian - Not Authenticated", async () => {
    //         const res = await request.post('/api/library-system/backend/admin/book/add-new').set('Cookie', '').send();
    //         expect(res.status).toBe(401);
    //     });
    // });

    // describe("GET - Fetch Book - /book-:id", () => {
    //     test("Fetch Book Success - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-${bk._id}`).set('Cookie', cookies);
    //         expect(res.status).toBe(200);
    //         expect(res.body.book).not.toBeNull();
    //     });

    //     test("Fetch Not Exist Book - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-${new mongoose.Types.ObjectId('56376gs5434r')}`).set('Cookie', cookies);
    //         expect(res.status).toBe(200);
    //         expect(res.body.book).toBeNull();
    //     });

    //     test("Fetch Book Invalid ID Format Book - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-56376gs54`).set('Cookie', cookies);
    //         expect(res.status).toBe(500);
    //     });

    //     test("All Book Fetch as Librarian - Not Authenticated", async () => {
    //         const res = await request.post('/api/library-system/backend/admin/book/add-new').set('Cookie', '').send();
    //         expect(res.status).toBe(401);
    //     });
    // });

    // describe("PUT - Update Book - /book-update/:id", () => {
    //     test("Update Book Success - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         bookFake.title = 'The new Title Book'
    //         const res = await request.put(`/api/library-system/backend/admin/book/book-update/${bk._id}`).set('Cookie', cookies).send(bookFake);
    //         expect(res.status).toBe(200);
    //         expect(res.body.book.title).toBe(bookFake.title);
    //     });

    //     test("Update Book 422 - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         bookFake.title = ''
    //         const res = await request.put(`/api/library-system/backend/admin/book/book-update/${bk._id}`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send(bookFake);
    //         expect(res.status).toBe(422);
    //     });

    //     test("Update Book Not Exist - Librarian", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         bookFake.title = 'The new Title Book'
    //         const res = await request.put(`/api/library-system/backend/admin/book/book-update/${new mongoose.Types.ObjectId('56376gs5434r')}`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send(bookFake);
    //         expect(res.status).toBe(400);
    //         expect(res.body.message).toBe('Updating Book Failed');
    //     });

    //     test("Update Book Invalid Role - User", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAccount();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const cookies = resCookie.headers['set-cookie'];
    //         bookFake.title = 'The new Title Book'
    //         const res = await request.put(`/api/library-system/backend/admin/book/book-update/${bk._id}`).set('Cookie', cookies).send(bookFake);
    //         expect(res.status).toBe(401);
    //     });

    //     test("Update Book UnAuthenticated", async () => {
    //         const bookFake = JSON.parse(JSON.stringify(books[0]));
    //         let bk = await bookFakeAdd(bookFake)
    //         let userAdminFake = await createUserAccount();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         bookFake.title = 'The new Title Book'
    //         const res = await request.put(`/api/library-system/backend/admin/book/book-update/${bk._id}`).set('Cookie', '').send(bookFake);
    //         expect(res.status).toBe(401);
    //     });
    // });

    describe("DELETE - Delete Book - /delete/:id_book", () => {
        test("Delete Book Success - Librarian", async () => {
            const bookFake = JSON.parse(JSON.stringify(books[0]));
            let bk = await bookFakeAdd(bookFake)
            let userAdminFake = await createUserAdmin();
            const resCookie = await signInUserFake(userAdminFake);
            expect(resCookie.status).toBe(200);
            bookFake.title = 'The new Title Book'
            const res = await request.delete(`/api/library-system/backend/admin/book/delete/${bk._id}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(200);
        });

        test("Delete Book Invalid Role", async () => {
            const bookFake = JSON.parse(JSON.stringify(books[0]));
            let bk = await bookFakeAdd(bookFake)
            let userAdminFake = await createUserAccount();
            const resCookie = await signInUserFake(userAdminFake);
            expect(resCookie.status).toBe(200);
            bookFake.title = 'The new Title Book'
            const res = await request.delete(`/api/library-system/backend/admin/book/delete/${bk._id}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(401);
        });

        test("Delete Book Invalid ID", async () => {
            const bookFake = JSON.parse(JSON.stringify(books[0]));
            let bk = await bookFakeAdd(bookFake)
            let userAdminFake = await createUserAdmin();
            const resCookie = await signInUserFake(userAdminFake);
            expect(resCookie.status).toBe(200);
            bookFake.title = 'The new Title Book'
            const res = await request.delete(`/api/library-system/backend/admin/book/delete/${new mongoose.Types.ObjectId('56376gs5434r')}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(400);
        });

        test("Delete Book Other Copies is Borrowed", async () => {
            const bookFake = JSON.parse(JSON.stringify(books[0]));
            let bk = await bookFakeAdd(bookFake)
            let userAdminFake = await createUserAdmin();
            const resCookie = await signInUserFake(userAdminFake);
            expect(resCookie.status).toBe(200);
            let due_date = new Date().toLocaleDateString('en-US', {timeZone: 'Asia/Manila'})
            await LoanClass.loanCreate({user: resCookie.body.user?._id, book:bk._id, due_date});
            bookFake.title = 'The new Title Book'
            const res = await request.delete(`/api/library-system/backend/admin/book/delete/${bk._id}`)
            .set('Cookie', resCookie.headers['set-cookie']);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Cannot Delete this book. other copies was borrowed.');
        });
    });

    // describe("POST - Search Book - /book-search/details", () => {
    //     test("Search Book Success - Librarian", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.post(`/api/library-system/backend/admin/book/book-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search:booskFake[0].title});
    //         expect(res.status).toBe(200);
    //         expect(res.body.books.length).toBeGreaterThan(0);
    //     });

    //     test("Search Book UnAuthenticated", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.post(`/api/library-system/backend/admin/book/book-search/details`)
    //         .set('Cookie', '').send({search:booskFake[0].title});
    //         expect(res.status).toBe(401);
    //     });

    //     test("Search Book Invalid Role", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAccount();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.post(`/api/library-system/backend/admin/book/book-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search:booskFake[0].title});
    //         expect(res.status).toBe(401);
    //     });

    //     test("Search Book Success But No Result - Librarian", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.post(`/api/library-system/backend/admin/book/book-search/details`)
    //         .set('Cookie', resCookie.headers['set-cookie']).send({search:`jnh22`});
    //         expect(res.status).toBe(200);
    //         expect(res.body.books.length).toEqual(0);
    //     });
    // });

    // describe("GET - DashBoard Books - /book-dashboard/counts", () => {
    //     test("Fetch DashBoard Books Success - Librarian", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-dashboard/counts`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.datas[0]).toHaveProperty('Books_Count', 4);
    //         expect(res.body.datas[0]).toHaveProperty('Book_Available', 2);
    //         expect(res.body.datas[0]).toHaveProperty('Book_UnAvailable', 2);
    //     });

    //     test("Fetch DashBoard Books Success - No Books - Librarian", async () => {
    //         let userAdminFake = await createUserAdmin();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-dashboard/counts`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(200);
    //         expect(res.body.datas[0]).toHaveProperty('Book_UnAvailable', 0);
    //     });

    //     test("Fetch DashBoard Books Invalid Role - User", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         let userAdminFake = await createUserAccount();
    //         const resCookie = await signInUserFake(userAdminFake);
    //         expect(resCookie.status).toBe(200);
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-dashboard/counts`)
    //         .set('Cookie', resCookie.headers['set-cookie']);
    //         expect(res.status).toBe(401);
    //     });

    //     test("Fetch DashBoard Books UnAuthenticated", async () => {
    //         const booskFake = JSON.parse(JSON.stringify(books));
    //         booskFake.forEach(async(bookFake: Omit<BookModel, "_id"|"created_at"|"updated_at">) => {
    //             await bookFakeAdd(bookFake)
    //         });
    //         const res = await request.get(`/api/library-system/backend/admin/book/book-dashboard/counts`)
    //         .set('Cookie', '');
    //         expect(res.status).toBe(401);
    //     });

    // });

});