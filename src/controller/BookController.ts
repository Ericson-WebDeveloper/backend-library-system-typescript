import { IUpdateBookRequest } from '../Types/Book';
import BookClass from '../class/BookClass';
import LoanClass from '../class/LoanClass';
import {Request, Response, NextFunction} from 'express'

export const RegisterBook = async (req: Request, res: Response) => {
    try {
        const {title, isbn, author, categories, copies, image} = req.body;
        let response = await BookClass.addBook({title, isbn, author, categories, copies, image, status: copies >= 1 ? 'available' : 'unavailable'});
        if(response) {
            return res.status(200).json({message: 'Register New Book Success', book: response });
        }
        return res.status(400).json({message: 'Register Failed'});
    } catch (error: any) {
        return res.status(500).json({message: 'Registration New Book Failed. Server Error.', error_details:{...error}});
    }
}

export const BooksAll = async(req: Request<{}, {}, {}, {page: string, title: string, isbn: string, author: string, status:string}, {}>, res: Response) => {
    try {
        const pageNumber = parseInt(req?.query?.page) || 1;
        const searchInput = {
            title: req?.query?.title || '',
            isbn: req?.query?.isbn || '',
            author: req?.query?.author || '',
            status: req?.query?.status ? req?.query?.status == 'all' ? '' : req.query.status : ''
        }
        const limit = 2;
        let response = await BookClass.books(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'Request Book List Success', books: response });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Request Book List Failed. Server Error.', error_details: Object.values(error)});
    }
}

export const GetBook = async(req: Request<{id: string}, {}, {}, {}, {}>, res: Response) => {
    try {
        const {id} = req.params;
        let response = await BookClass.bookFind(id);
        return res.status(200).json({message: 'Request Book Success', book: response });
    } catch (error: any) {
        return res.status(500).json({message: 'Registration New Book Failed. Server Error.', error_details:{...error}});
    }
}

export const RemoveBook = async(req: Request<{id_book: string}, {}, {}, {}, {}>, res: Response) => {
    try {
        const {id_book} = req.params;
        let count = await LoanClass.countBookLoan(id_book);

        if(count >= 1) {
            return res.status(400).json({message: 'Cannot Delete this book. other copies was borrowed.'});
        }

        let response = await BookClass.bookRemove(id_book);

        if(!response) {
            return res.status(400).json({message: 'Book Remove Failed.'});
        }
        return res.status(200).json({message: 'Request Book Delete Success'});
    } catch (error: any) {
        return res.status(500).json({message: 'Request Book Delete Failed. Server Error.', error_details:{...error}});
    }
}


export const UpdateBook = async (req: Request<{id: string}, {}, IUpdateBookRequest, {}, {}>, res: Response) => {
    try {
        const {id} = req.params;
        const {title, isbn, author, categories, copies, image} = req.body;
        let response = await BookClass.bookUpdate({id, title, isbn, author, categories, copies, image, status: 
            copies >= 1 ? 'available' : 'unavailable'});
        if(response) {
            return res.status(200).json({message: 'Updating Book Success', book: response });
        }
        return res.status(400).json({message: 'Updating Book Failed'});
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Updating Book Failed. Server Error.', error_details: {...error}});
    }
}

export const BooksDashBoard = async(req: Request, res: Response) => {
    try {
        let datas = await BookClass.booksDashBoardAdmin();
        return res.status(200).json({message: 'Book DashBoard Request Success', datas });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Book DashBoard Request Failed. Server Error.', error_details: {...error}});
    }
}

export const SearchBooks = async(req: Request<{}, {}, {search:string}, {}>, res: Response) => {
    try {
        const {search} = req.body;
        let books = await BookClass.bookSearching(search);
        return res.status(200).json({message: 'Book Search Success', books });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Updating Book Failed. Server Error.', error_details: {...error}});
    }
}


