import LoanClass from '../class/LoanClass';
import { sendEmailLoanNotif } from '../helper/Mailer';
import moment from 'moment';
import { mongo } from 'mongoose';
import UserClass from '../class/UserClass';
import BookClass from '../class/BookClass';
import {Request, Response, NextFunction} from 'express'
import { UserModel } from '../Types/User';
import { BookModel } from '../Types/Book';
import { LoadModel } from '../Types/Loan';
import { RoleModel } from '../Types/Role';


export const RegisterBookBorrowed = async (req: Request<{},{},{user: UserModel, book: BookModel, due_date: string}, {}>, res: Response) => {
    try {
        let {user, book, due_date} = req.body;
        let userRef = user._id;
        let bookRef = book._id;

        let userBorrower = await UserClass.userFindById(userRef);
        let bookExist = await BookClass.bookFind(bookRef);
        
        if(bookExist && bookExist.copies == 0) {
            return res.status(400).json({message: 'Book Not Available'});
        }
        // check if have current borrewed same book

        if(userBorrower && userBorrower.warning >= 3) {
            return res.status(400).json({message: 'This User Has many warning. for the mean time this user are not allowed borrowed'});
        }

        let responseLoan = await LoanClass.loanCreate({user:userRef, book:bookRef, due_date});
        
        let bookResponse = await BookClass.bookBorrowed(bookRef);
        
        if(bookResponse && bookResponse.copies == 0) {
            bookResponse = await BookClass.bookUpdateStatus(bookRef, 'unavailable')
        }
        if(responseLoan && bookResponse) {
            return res.status(200).json({message: 'Create Borrowed Book Success', loan: responseLoan });
        }
        return res.status(400).json({message: 'Create Borrowed Book Failed'});
    } catch (error: any) {
        // console.log(error);
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
}

export const LoansList = async(req: Request<{},{},{},{page:string, book: string|null, user: string|null, 
    issue_date: string|null, due_date: string|null, return_date: string|null, status: string|null}, {}>, res: Response) => {
    try {
        let pageNumber = parseInt(req?.query?.page) || 1;
        const searchInput = {
            book: req?.query?.book || '',
            user: req?.query?.user || '',
            issue_date: req?.query?.issue_date || '',
            due_date: req?.query?.due_date || '',
            return_date: req?.query?.return_date || '',
            status: req?.query?.status ? req?.query?.status == 'all' ? '' : req.query.status : ''
        }
        let limit = 2;
        let response = await LoanClass.loans(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'Loan List Request Success', loans: response });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({message: 'Loan List Request Failed. Server Error.', error_details:{...error}});
    }
} 

export const SendEmailNotifLoanReturn = async (req: Request<{id_loan:string},{},{},{},{}>, res: Response) => {
    try {
        const {id_loan} = req.params;
        let loan = await LoanClass.loanFind(id_loan);

        if(!loan) {
            return res.status(400).json({message: 'Cannot Find Data. Cannot Send Email Notification'});
        }

        const {user, book, ...loandata} = loan;

        const date = {
            returndate: loan?.return_date ? moment(loan.return_date).format('MMMM Do YYYY, h:mm:ss a') : 'null',
            duedate:  moment(loan.due_date).format('MMMM Do YYYY, h:mm:ss a'),
            issuedate: moment(loan.issue_date).format('MMMM Do YYYY, h:mm:ss a')
        }
        
        let response = await sendEmailLoanNotif(user.email, 'librarysystem@gmail.com', "Return Book's Notification", user, book, date);
        if(!response) {
            return res.status(400).json({message: 'Cannot Send Email Notification. Email Server Error'});
        }
        return res.status(200).json({message: 'Email Send Success'});
    } catch (error: any) {
       
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
}

export const LoansFindId = async(req: Request<{id_loan: string}, {}, {}, {}, {}>, res: Response) => {
    try {
        const {id_loan} = req.params;
        let response = await LoanClass.loanFind(id_loan);
        // @ts-ignore
        const {role, _id} = req.user as Omit<UserModel, 'role'>&{ role: RoleModel[]};

        let isUser = role.find(({name}) => name === 'User');

        if(isUser) {
            if(response && response.user._id == _id) {
                return res.status(200).json({message: 'Loan Details Request Success', loan: response }); 
            }
            return res.status(401).json({message: 'You are unAthorized to access this data'}); 
        } 
        return res.status(200).json({message: 'Loan Details Request Success', loan: response }); 
    } catch (error: any) {
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
} 

export const UpdateLoanDueDate = async(req: Request<{id_loan: string}, {}, {_id:string}, {}, {}>, res: Response) => {
    try {
        const {id_loan} = req.params;        
        if(id_loan !== req.body._id) {
            return res.status(400).json({message: 'Loan Returning book Failed'});
        }
        // validate if they have 3 warning in not fulfilling returning on time the book;

        let loan = await LoanClass.loanFind(id_loan);

        let currentDateTime = new Date();
        // let date = currentDateTime.toISOString('en-US', { timeZone: 'Asia/Manila' });
        let date = new Date(currentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }));

        if(loan && loan.due_date! >= date) {
            await UserClass.userIncWarning(loan.user._id);
        }

        let loanresponse = await LoanClass.loanUpdateDueDate(id_loan);
        if(!loanresponse) {
            return res.status(400).json({message: 'Data Not Found'}); 
        }
        let bookResponse = await BookClass.bookReturn(loanresponse.book._id.toString());
        if(!bookResponse) {
            return res.status(400).json({message: 'Data Not Found'}); 
        }
        if(bookResponse.copies != 0 && bookResponse.status == 'unavailable') {
            bookResponse = await BookClass.bookUpdateStatus(bookResponse._id, 'available')
        }

        if(loanresponse && bookResponse) {
            return res.status(200).json({message: 'Loan Update Request Success', loan: loanresponse }); 
        } 
            return res.status(400).json({message: 'Loan Update Request Failed', loan: loanresponse }); 
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({message: 'Loan Update Failed. Server Error.', error_details:{...error}});
    }
} 


export const LoansListUser = async(req: Request<{user_id:string}, {}, {}, {page:string}, {}>, res: Response) => {
    try {
        let {user_id} = req.params;
        let pageNumber = parseInt(req?.query?.page) || 1;
        let limit = 1;
        let loans = await LoanClass.loansUser(pageNumber, limit, user_id);
        return res.status(200).json({message: 'Loan List By User Request Success', loans });
    } catch (error: any) {
        return res.status(500).json({message: 'Loan List By User Failed. Server Error.', error_details:{...error}});
    }
} 

export const LoanDashBoardDatas = async(req: Request, res: Response) => {
    try {
        let loanscount = await LoanClass.AdminDashboardDatas();
        return res.status(200).json({message: 'Loan Counts Request Success', loanscount });
    } catch (error: any) {
        return res.status(500).json({message: 'Loan Counts Request Failed. Server Error.', error_details:{...error}});
    }
}

export const LoanDashBoardDataUser = async(req: Request<{id_user:string}, {}, {}, {}, {}>, res: Response) => {
    try {
        const {id_user} = req.params;
        let loanscount = await LoanClass.UserDashboardDatas(id_user);
        return res.status(200).json({message: 'Loan Counts Request Success', loancount: loanscount[0] ?? null });
    } catch (error: any) {
        // console.log(error)
        return res.status(500).json({message: 'Loan Counts Request Failed. Server Error.', error_details:{...error}});
    }
}
