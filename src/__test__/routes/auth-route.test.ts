// import request from 'supertest'
import * as db from '../db';
import supertest from 'supertest';
import server from '../../server';
import users from '../../config/user.json';
import { createUser } from '../UserSeeder';
import UserClass from '../../class/UserClass';
import RoleClass from '../../class/RoleClass';

// jest.mock("../../class/UserClass");

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

// describe('Test request with mongoose', () => {
//    test('GET - /', async () => {
//       const res = await request.get('/api/test-route').send();
//       console.log(res.status)
//     //   expect(res.status).toBe(200);
//     //   expect(message).toBe('Hello World!');
//    });
// });

// describe('Test with route post /sign-up', () => {
//     describe("Auth routes Signup", () => {
//         test('POST - post signup success', async () => {
//             let userFake = JSON.parse(JSON.stringify(users[1]));
//             let userData = {
//                 firstname: userFake.firstname,
//                 lastname: userFake.lastname,
//                 middlename: userFake.middlename,
//                 email: userFake.email,
//                 password: userFake.password,
//                 avatar: userFake.details.avatar,
//                 phone: userFake.details.phone
//             }
//             const res = await request.post('/api/library-system/backend/sign-up').send(userData);
//             expect(res.status).toBe(200);
//             expect(res.body).toHaveProperty('message');
//          });

//          test('POST - post signup error 422', async () => {
//             let userFake = JSON.parse(JSON.stringify(users[1]));
//             let userdata = {
//                 firstname: '',
//                 lastname: userFake.lastname,
//                 middlename: userFake.middlename,
//                 email: '',
//                 password: userFake.password,
//                 avatar: userFake.details.avatar,
//                 phone: userFake.details.phone
//             }
//             const res = await request.post('/api/library-system/backend/sign-up').send(userdata);
//             expect(res.status).toBe(422);
//             expect(Array.isArray(res.body.errors)).toBe(true);
//             expect(res.body.errors.length).toEqual(2);
//          });

//         //  test('POST - post signup error 400', async () => {
//         //     const res = await request.post('/api/library-system/backend/sign-up').send(user);
//         //     expect(res.status).toBe(400);
//         //  });
//     });
//  });


//  describe('Test with route post /sign-in', () => {
//     describe("Auth routes SigIn", () => {
//         test('POST - post signin success', async () => {
//             let userFake = JSON.parse(JSON.stringify(users[1]));
//             let userData = {
//                 firstname: userFake.firstname,
//                 lastname: userFake.lastname,
//                 middlename: userFake.middlename,
//                 email: userFake.email,
//                 password: userFake.password,
//                 details: {
//                     avatar: userFake.details.avatar,
//                     phone: userFake.details.phone
//                 },
//                 role: [await RoleClass.roleUser() as string]
//             }
//             await createUser(userData);
//             const res = await request.post('/api/library-system/backend/sign-in').send({email: userData.email, password: userData.password});
//             expect(res.status).toBe(200);
//             expect(res.body).toHaveProperty('message');
//          });
//         test('POST - post signin 400 - invalid email/user', async () => {
//             let userFake = {
//                 email: users[1].email,
//                 passwor: '123'
//             }
//             const res = await request.post('/api/library-system/backend/sign-in').send(userFake);
//             expect(res.status).toBe(400);
//             expect(res.body).toHaveProperty('message');
//         });
//         test('POST - post signin 400 - invalid password', async () => {
//             let userFake = JSON.parse(JSON.stringify(users[1]));
//             let userData = {
//                 firstname: userFake.firstname,
//                 lastname: userFake.lastname,
//                 middlename: userFake.middlename,
//                 email: userFake.email,
//                 password: userFake.password,
//                 details: {
//                     avatar: userFake.details.avatar,
//                     phone: userFake.details.phone
//                 },
//                 role: [await RoleClass.roleUser() as string]
//             }
//             await createUser(userData);
//             const res = await request.post('/api/library-system/backend/sign-in').send({email: userData.email, password: '2345'});
//             expect(res.status).toBe(400);
//             expect(res.body).toHaveProperty('message');
//             expect(res.body.message).toBe('Invalid your password/email credentials.');
//         });
//     });

//     describe('Test route with /user-me',  () => {
//         describe("Auth routes User-Me",  () => {
//             test("GET - Fetch user Details of Authenticated ", async () => {
//                 let userFake = JSON.parse(JSON.stringify(users[1]));
//                 let userData = {
//                     firstname: userFake.firstname,
//                     lastname: userFake.lastname,
//                     middlename: userFake.middlename,
//                     email: userFake.email,
//                     password: userFake.password,
//                     details: {
//                         avatar: userFake.details.avatar,
//                         phone: userFake.details.phone
//                     },
//                     role: [await RoleClass.roleUser() as string]
//                 }
//                 await createUser(userData);
//                 const resCookie = await request.post('/api/library-system/backend/sign-in').send({email: userData.email, password: userData.password});
//                 expect(resCookie.status).toBe(200);
//                 const cookies = resCookie.headers['set-cookie'];
//                 const res = await request.get(`/api/library-system/backend/user-me`).set('Cookie', cookies);
//                 expect(res.status).toBe(200);
//             }); 

//             test("GET - Fetch user Details of UnAuthenticated ", async () => {
//                 const res = await request.get(`/api/library-system/backend/user-me`).set('Cookie', '');
//                 expect(res.status).toBe(401);
//             }); 

//             // test("GET - Fetch user Details of Authenticated with expire token", async () => {
               
//             // }); 
//         });

//     });
//  });

 describe('Test route with /refresh-authetication',  () => {
    describe("Auth routes Refresh Token",  () => {
        test("GET - Renew Token Valid", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            const resCookie = await request.post('/api/library-system/backend/sign-in').send({email: userData.email, password: userData.password});
            expect(resCookie.status).toBe(200);
            const cookies = resCookie.headers['set-cookie'];
            const res = await request.get(`/api/library-system/backend/refresh-authetication`).set('Cookie', cookies);
            expect(res.status).toBe(200);
        }); 

        test("GET - Renew Token InValid", async () => {
            const res = await request.get(`/api/library-system/backend/refresh-authetication`);
            expect(res.status).toBe(401);
        }); 

        // test("GET - Fetch user Details of Authenticated with expire token", async () => {
           
        // }); 
    });

});


describe('Test route with /logout',  () => {
    describe("Auth routes Logout",  () => {
        test("POST - LogOut Authenticated", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            const resCookie = await request.post('/api/library-system/backend/sign-in').send({email: userData.email, password: userData.password});
            expect(resCookie.status).toBe(200);
            const cookies = resCookie.headers['set-cookie'];
            const res = await request.post(`/api/library-system/backend/logout`).set('Cookie', cookies);
            expect(res.status).toBe(200);
        }); 

        test("POST - LogOut Not Authenticated", async () => {
            const res = await request.post(`/api/library-system/backend/logout`).set('Cookie', '');
            expect(res.status).toBe(401);
        });
    });

    describe("Not Required Auth routes /logout-force/backup-route",  () => {
        test("POST - LogOut Not Authenticated", async () => {
            const res = await request.post(`/api/library-system/backend/logout-force/backup-route`).set('Cookie', '');
            expect(res.status).toBe(200);
        }); 
    });
});


describe('Test route with /user/reset-password',  () => {
    describe("routes with submit request /request ",  () => {
        test("POST - Valid Email - Password Reset Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            const res = await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: userData.email});
            expect(res.status).toBe(200);
        }); 

        test("POST - InValid Email - Password Reset Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            const res = await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: 'user_123@gmail.comc'});
            expect(res.status).toBe(400);
        }); 
    });

    describe("routes with submit request /submit ",  () => {
        test("POST - Valid - Password Submit Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: userData.email});
            const userToken = await UserClass.findByEmailUser(userData.email);
            const res = await request.post(`/api/library-system/backend/user/reset-password/submit`)
                .send({email: userData.email, token: userToken?.token?.value, password: 'Pass@_123'});
            expect(res.status).toBe(200);
        }); 

        test("POST - InValid Data - Password Submit Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: userData.email});
            const userToken = await UserClass.findByEmailUser(userData.email);
            const res = await request.post(`/api/library-system/backend/user/reset-password/submit`)
                .send({email: userData.email, token: userToken?.token?.value, password: 'pass123'});
            expect(res.status).toBe(422);
        }); 

        test("POST - InValid Email - Password Submit Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: userData.email});
            const userToken = await UserClass.findByEmailUser(userData.email);
            const res = await request.post(`/api/library-system/backend/user/reset-password/submit`)
                .send({email: 'euser@gmail.com', token: userToken?.token?.value, password: 'Pass@_123'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid email.')
        }); 

        test("POST - User Have not Token Value Generate - Password Submit Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            const res = await request.post(`/api/library-system/backend/user/reset-password/submit`)
                .send({email: userData.email, token: '', password: 'Pass@_123'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('No Token Generate for this request.')
        }); 

        test("POST - Token User & Token Post not Match- Password Submit Request", async () => {
            let userFake = JSON.parse(JSON.stringify(users[1]));
            let userData = {
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
            await request.post(`/api/library-system/backend/user/reset-password/request`).send({email: userData.email});
            const userToken = await UserClass.findByEmailUser(userData.email);
            const res = await request.post(`/api/library-system/backend/user/reset-password/submit`)
                .send({email: userData.email, token: userToken?.token?.value+"skk", password: 'Pass@_123'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Token Invalid.')
        }); 
    });
});


// describe('', () => {
//     describe('auth login route', () => {
//         test('422 test', () => {
//             let name = 'Ericson';
//             expect(name).toBe('Ericson');
//         });
        
//         test('400 test', () => {
//             let name = 'Ericson';
//             expect(name).toBe('Ericson');
//         });

//         test('201 test', () => {
//             let name = 'Ericson';
//             expect(name).toBe('Ericson');
//         });
//     })
   
//     test('the best flavor is grapefruit', () => {
//         let name = 'Ericson';
//         expect(name).toBe('Ericson');
//     });

//     test('the best flavor is grapefruit', () => {
//         let name = 'Ericson';
//         expect(name).toBe('Ericson');
//     });
// });
