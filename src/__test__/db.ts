import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Role from '../model/Role';
const mongod = MongoMemoryServer.create();

export const connect = async () => {
   const uri = await (await mongod).getUri();
   await mongoose.connect(uri);
}
export const closeDatabase = async () => {
   await mongoose.connection.dropDatabase();
   await mongoose.connection.close();
   await (await mongod).stop();
}
export const clearDatabase = async () => {
   const collections = mongoose.connection.collections;
   for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
   }
}

export const collectionDatabase = async (collection: string) => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        if(collection == key) {
            return collections[key];
        }
    }
 }

export const RoleSeeder = async () => {
    await Role.insertMany([
        {
            name: 'Librarian'
        },
        {
            name: 'User'
        }
    ]);
}