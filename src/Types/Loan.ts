import { BookModel } from './Book';
import { UserModel } from './User';


export interface LoadModel {
    _id: string
    user: string | UserModel
    book: string | BookModel
    status: 'return' | 'not return'
    issue_date: Date,
    due_date?: Date
    return_date?: Date
}