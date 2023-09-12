import * as db from '../db';
import supertest from 'supertest';
import server from '../../server';
import users from '../../config/user.json';
import RoleClass from '../../class/RoleClass';
import { createUser } from '../UserSeeder';
import { BookModel } from '../../Types/Book';
import BookClass from '../../class/BookClass';
import books from '../../config/book.json';
import mongoose from 'mongoose';

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

const bookFakeAdd = async (book: Omit<BookModel, '_id'|'created_at'>) => {
    return await BookClass.addBook(book)
}


describe("Book Class Unit Test", () => {

    test("Creating Book", async() => {
        let bookFake = JSON.parse(JSON.stringify(books[0]));
        let book = await BookClass.addBook(bookFake);
        let bookCollection = await db.collectionDatabase('books');
        expect(await bookCollection?.findOne({_id: new mongoose.Types.ObjectId(book?._id)})).not.toBeNull();
        expect(book).not.toBeNull();
    });
    
    test("Return Object Fields To Array", async() => {
        let fields = BookClass.returnField({name: 'Eric', email: 'email@gmail.com'});
        expect(fields).not.toBeNull();
    });

    test("Return Object Fields To Query Params - With Empty Object", async() => {
        let fields = BookClass.returnQuery({ });
        expect(fields).toBe('');
    });

    test("Return Object Fields To Query Params", async() => {
        let fields = BookClass.returnQuery({ });
        expect(fields).toBe('');
    });

    test("queryWithAggregate", async() => {
        let bookFake = JSON.parse(JSON.stringify(books[0]));
        let book = await BookClass.addBook(bookFake);
        let bookResponse = await BookClass.queryWithAggregate(null);
        expect(bookResponse).not.toBeNull();
        expect(bookResponse[0].isbn).toEqual(book.isbn);
    });

    test("queryWithAggregate - With Params", async() => {
        let bookFake = JSON.parse(JSON.stringify(books[0]));
        let book = await BookClass.addBook(bookFake);
        let bookResponse = await BookClass.queryWithAggregate({title: book.title, isbn: '', author:'', status: ''});
        expect(bookResponse).not.toBeNull();
        expect(bookResponse[0].isbn).toEqual(book.isbn);
    });

    test("queryWithAggregate - With Invalid Params", async() => {
        let bookFake = JSON.parse(JSON.stringify(books[0]));
        let book = await BookClass.addBook(bookFake);
        let bookResponse = await BookClass.queryWithAggregate({title: '', isbn: '', author: 'Ericson', status: ''});
        expect(bookResponse).toEqual([]);
    });

    test("querySearchCount", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[0]));
        let book = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        let bookResponse = await BookClass.querySearchCount(null);
        expect(bookResponse).toBe(2);
    });

    test("querySearchCount - With Params", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let book = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        let bookResponse = await BookClass.querySearchCount({title: '', isbn: bookFake2.isbn, author: '', status: ''});
        expect(bookResponse).toBe(1);
    });

    test("books", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        let bookResponse = await BookClass.books(1,2, null);
        expect(bookResponse.data.length).toBe(2);
    });

    test("books - with search params", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        let bookResponse = await BookClass.books(1,2, {title: bookFake1.title, isbn: '', author: bookFake2.author, status: ''});
        expect(bookResponse.data.length).toBe(2);
    });

    test("bookSearch - with search params", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        let bookResponse = await BookClass.bookSearch({title: bookFake1.title});
        expect(bookResponse.length).toBe(1);
    });

    test("booksDashBoardAdmin", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.booksDashBoardAdmin();
        expect(bookResponse[0]).toHaveProperty('Books_Count', 4);
        expect(bookResponse[0]).toHaveProperty('Book_Available', 2);
        expect(bookResponse[0]).toHaveProperty('Book_UnAvailable', 2);
    });

    test("bookSearching", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookSearching(bookFake2.title);
        expect(bookResponse.length).toBe(1);
    });

    test("bookFind", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        let fakeBook = await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookFind(fakeBook._id);
        expect(bookResponse).not.toBeNull();
        expect(bookResponse?.title).toEqual(fakeBook.title)
    });

    test("booksAvailable", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        let fakeBook = await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.booksAvailable();
        expect(bookResponse.length).toEqual(2)
    });

    test("booksUnAvailable", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        let fakeBook = await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.booksUnAvailable();
        expect(bookResponse.length).toEqual(2)
    });

    test("bookUpdate", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        await BookClass.addBook(bookFake1);
        let fakeBook = await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookUpdate({id: fakeBook._id, title: 'The New Title Kop World'});
        expect(bookResponse?.title).toEqual('The New Title Kop World')
    });

    test("bookRemove", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        let fakeBook = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookRemove(fakeBook?._id);
        let bookCollection = await db.collectionDatabase('books');
        expect(await bookCollection?.findOne({_id: new mongoose.Types.ObjectId(fakeBook?._id)})).toBeNull();
    });

    test("bookBorrowed", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        let fakeBook = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookBorrowed(fakeBook?._id);
        expect(bookResponse?.copies).toEqual(fakeBook.copies - 1);
    });

    test("bookReturn", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        let fakeBook = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookBorrowed(fakeBook?._id);
        expect(bookResponse?.copies).toEqual(fakeBook.copies - 1);
        let bookReturnResponse = await BookClass.bookReturn(fakeBook?._id);
        expect(bookReturnResponse?.copies).toEqual(fakeBook.copies);
    });

    test("bookUpdateStatus", async() => {
        let bookFake1 = JSON.parse(JSON.stringify(books[0]));
        let bookFake2 = JSON.parse(JSON.stringify(books[1]));
        let bookFake3 = JSON.parse(JSON.stringify(books[2]));
        let bookFake4 = JSON.parse(JSON.stringify(books[3]));
        let fakeBook = await BookClass.addBook(bookFake1);
        await BookClass.addBook(bookFake2);
        await BookClass.addBook(bookFake3);
        await BookClass.addBook(bookFake4);
        let bookResponse = await BookClass.bookUpdateStatus(fakeBook?._id, 'unavailable');
        expect(bookResponse?.status).toEqual('unavailable');
    });

});