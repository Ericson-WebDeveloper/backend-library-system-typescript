import { BookModel } from '../Types/Book';
import { LoadModel } from '../Types/Loan';
import { UserModel } from '../Types/User';
import Loan from '../model/Loan';
import mongo from "mongodb";
import mongoose from 'mongoose'

interface iLookUp {
    from: string, 
    localField: string, 
    foreignField: string, 
    as: string, 
    pipeline: Array<any>
}

interface ILoanSerachInputs {
    book: string, 
    user: string, 
    issue_date: Date|string, 
    due_date: Date|string, 
    return_date: Date|string, 
    status: string
}

class LoanClass {

    public lookup1: iLookUp = {
        from: '',
        localField: '',
        foreignField: '',
        as: '',
        pipeline: []
    }

    public lookup2: {$lookup: iLookUp} = {
        $lookup: {
            from: '',
            localField: '',
            foreignField: '',
            as: '',
            pipeline: []
        }
    }

    __construct() {
        this.lookup1 =  {
                from: "users", //database name look for mongodb itself not in model
                localField: "user", // this is field in loan model -> in the bottom in pipeline _id to _id
                // because its array and ussually that pipline is optional
                foreignField: "_id", // this foreign id was in user model primary id
                as: "user",
                //control the join data parameters where id == id
                pipeline: [
                    {"$match": {"$expr": {$eq: ['_id', '_id']}}},  
                ]
        };
        this.lookup2 = {
            $lookup: {
                from: "books", //database name look for mongodb itself not in model
                localField: "book", // this is field in loan model -> in the bottom in pipeline _id to _id
                // because its array and ussually that pipline is optional
                foreignField: "_id", // this foreign id was in book model primary id
                as: "book",
                //control the join data parameters where id == id
                pipeline: [
                    {$match: {$expr: {$eq: ['_id', '_id']}}},
                ]
            }
        };
    }


    async queryWithAggregate(searchInputs: ILoanSerachInputs, startIndex = 0, limit = 2) {
        if(!searchInputs) {
            // return {$match};
            return await Loan.find().populate('user', '-password').populate('book').sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
        } else if(searchInputs.book == '' && searchInputs.user == '' && searchInputs.issue_date == '' && searchInputs.due_date == ''
         && searchInputs.return_date == '' && searchInputs.status == '') {
            // return {$match};
            return await Loan.find().populate('user', '-password').populate('book').sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
        } else {
            // https://www.appsloveworld.com/mongodb/100/47/optional-parameters-in-mongodb
            let conditions = [];
            if(searchInputs.book != '') {
                conditions.push({ 'book.title': { $regex: `.*${searchInputs.book}.*`, $options:  'i' } });
            }
            if(searchInputs.user != '') {
                conditions.push({ 'user.fullname': { $regex: `.*${searchInputs.user}.*`, $options:  'i' } });
            }
            if(searchInputs.issue_date != '') {
                conditions.push({ $expr: {$eq: ['$issuedate', searchInputs.issue_date ]} } );
            }
            if(searchInputs.due_date != '') {
                conditions.push({ $expr: {$eq: ['$duedate', searchInputs.due_date ]} } );
            }
            if(searchInputs.return_date != '') {
                conditions.push({ $expr: {$eq: ['$returndate', searchInputs.return_date ] }} );
            }
            if(searchInputs.status != '') {
                conditions.push({ status:  searchInputs.status});
            }
            let final_condition = conditions.length ? conditions : [];
            return await Loan.aggregate([
                {
                    $lookup: {
                        from: "users", //database name look for mongodb itself not in model
                        localField: "user", // this is field in loan model -> in the bottom in pipeline _id to _id
                        // because its array and ussually that pipline is optional
                        foreignField: "_id", // this foreign id was in user model primary id
                        as: "user",
                        //control the join data parameters where id == id
                        pipeline: [
                            {$match: {$expr: {$eq: ['_id', '_id']}}},  
                        ]
                    }
                    
                },
                {   $unwind:"$user" },

                {
                    $lookup: {
                        from: "books", //database name look for mongodb itself not in model
                        localField: "book", // this is field in loan model -> in the bottom in pipeline _id to _id
                        // because its array and ussually that pipline is optional
                        foreignField: "_id", // this foreign id was in book model primary id
                        as: "book",
                        //control the join data parameters where id == id
                        pipeline: [
                            {$match: {$expr: {$eq: ['_id', '_id']}}},
                        ]
                    }
                },
                {   $unwind:"$book" },

                {
                    $addFields: {
                        "user.fullname": {$concat: ["$user.firstname", " ", "$user.middlename", ". ", "$user.lastname"]},
                        "issuedate":  { $substr : ["$issue_date", 0, 10 ] },
                        "duedate":  { $substr : ["$due_date", 0, 10 ] },
                        "returndate":  { $substr : ["$return_date", 0, 10 ] },
                        // { $dateToString: {format: "%Y-%m-%d", date: "issue_date"} }
                    }
                },

                {
                    $match: {
                        $and: final_condition,
                        // $and: [
                        //     { "$book.title": searchInputs.book ? { $regex: `.*${searchInputs.book}.*`, $options:  'i' }: '' },
                        //     { "$user.fullname": searchInputs.user ? { $regex: `.*${searchInputs.user}.*`, $options:  'i' } : '' }
                        // ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user: 1,
                        // 'user.password': -1,
                        book: 1,
                        status: 1,
                        issue_date: 1,
                        due_date: 1,
                        return_date: 1,
                        // issuedate: 1,
                        // duedate: 1,
                        // returndate: 1,
                        // // count: { $size: "users" }
                    }
                }

            ]).sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
          
        }
    }

    async querySearchCount(searchInputs: ILoanSerachInputs) {
        if(!searchInputs) {
            // return {$match};
            return await Loan.find({}).count();
        } else if(searchInputs.book == '' && searchInputs.user == '' && searchInputs.issue_date == '' && searchInputs.due_date == ''
        && searchInputs.return_date == '' && searchInputs.status == '') {
            return await Loan.find({}).count();
        } else {
            let conditions = [];
            if(searchInputs.book != '') {
                conditions.push({ 'book.title': { $regex: `.*${searchInputs.book}.*`, $options:  'i' } });
            }
            if(searchInputs.user != '') {
                conditions.push({ 'user.fullname': { $regex: `.*${searchInputs.user}.*`, $options:  'i' } });
            }
            if(searchInputs.issue_date != '') {
                conditions.push({ $expr: {$eq: ['$issuedate', searchInputs.issue_date ]} } );
            }
            if(searchInputs.due_date != '') {
                conditions.push({ $expr: {$eq: ['$duedate', searchInputs.due_date ]} } );
            }
            if(searchInputs.return_date != '') {
                conditions.push({ $expr: {$eq: ['$returndate', searchInputs.return_date ] }} );
            }
            if(searchInputs.status != '') {
                conditions.push({ status:  searchInputs.status});
            }
            let final_condition = conditions.length ? conditions : [];
            let c = await Loan.aggregate([
                {
                    $lookup: {
                        from: "users", //database name look for mongodb itself not in model
                        localField: "user", // this is field in loan model -> in the bottom in pipeline _id to _id
                        // because its array and ussually that pipline is optional
                        foreignField: "_id", // this foreign id was in user model primary id
                        as: "user",
                        //control the join data parameters where id == id
                        pipeline: [
                            {$match: {$expr: {$eq: ['_id', '_id']}}},  
                        ]
                    }
                    
                },
                {   $unwind:"$user" },

                {
                    $lookup: {
                        from: "books", //database name look for mongodb itself not in model
                        localField: "book", // this is field in loan model -> in the bottom in pipeline _id to _id
                        // because its array and ussually that pipline is optional
                        foreignField: "_id", // this foreign id was in book model primary id
                        as: "book",
                        //control the join data parameters where id == id
                        pipeline: [
                            {$match: {$expr: {$eq: ['_id', '_id']}}},
                        ]
                    }
                },
                {   $unwind:"$book" },

                {
                    $addFields: {
                        "user.fullname": {$concat: ["$user.firstname", " ", "$user.middlename", ". ", "$user.lastname"]},
                        "issuedate":  { $substr : ["$issue_date", 0, 10 ] },
                        "duedate":  { $substr : ["$due_date", 0, 10 ] },
                        "returndate":  { $substr : ["$return_date", 0, 10 ] },
                        // { $dateToString: {format: "%Y-%m-%d", date: "issue_date"} }
                    }
                },

                {
                    $match: {
                        $and: final_condition
                    }
                },
                {
                    $count: "loans_count"
                }
            ]);
            return c.length > 0 ? c[0].loans_count : 0;
        }
    }


    async loans(pageNumber: number, limit: number, searchInput: ILoanSerachInputs|null = null) {
        let result: {totalDatas: number, totalPage: number, previous: null|{ pageNumber: number|null, limit: number}, 
            next: {pageNumber: number, limit: number} | null, 
            currePage: number, rowsPerPage: number, data: LoadModel[]} = {
            totalDatas: 0,
            totalPage: 0,
            previous: null,
            next: null,
            currePage: 0,
            rowsPerPage: 0,
            data: []
        };
        // let count = await Loan.find().count();
        let count = await this.querySearchCount(searchInput!);
        // const totalDatas = await User.find({}).count();
        // https://www.youtube.com/watch?v=ja4yIn2pCzw
        // https://github.com/TomDoesTech/mongodb-react-pagination/blob/main/server/src/index.js
        let startIndex = (pageNumber - 1) * limit;
        const endIndex = (pageNumber + 1) * limit;
        result.totalDatas = count;
        result.totalPage = Math.ceil(count / limit)

        result.previous = startIndex > 0 ? { pageNumber: (pageNumber - 1 === 0) ? null : pageNumber - 1 , limit: limit } : null ;
        // result.next = endIndex < (await Loan.find().count()) ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.next = endIndex < count ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.currePage = pageNumber;
        result.rowsPerPage = limit;

        result.data = await this.queryWithAggregate(searchInput!, startIndex, limit);
        return result;
    }

    async loanFind(id: string): Promise<Omit<LoadModel, 'user'|'book'> & {user: UserModel, book: BookModel}|null> {
        return await Loan.findById(id).populate('user', '-role').populate('book');
    }

    async loansUser(pageNumber: number, limit: number, userid: string) {
        let result: {totalDatas: number, totalPage: number, previous: null|{ pageNumber: number|null, limit: number}, 
            next: {pageNumber: number, limit: number} | null, 
            currePage: number, rowsPerPage: number, data: LoadModel[]} = {
            totalDatas: 0,
            totalPage: 0,
            previous: null,
            next: null,
            currePage: 0,
            rowsPerPage: 0,
            data: []
        };
        let count = await Loan.find({user: userid}).count();
        let startIndex = (pageNumber - 1) * limit;
        let endIndex = (pageNumber + 1) * limit;
        result.totalDatas = count;
        result.totalPage = Math.ceil(count / limit)

        result.previous = startIndex > 0 ? { pageNumber: (pageNumber - 1 === 0) ? null : pageNumber - 1 , limit: limit } : null ;
        // result.next = endIndex < (await Loan.find({user: userid}).count()) ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.next = endIndex < count ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.currePage = pageNumber;
        result.rowsPerPage = limit;
        result.data = await Loan.aggregate([
            {
                $lookup: {
                    from: "users", //database name look for mongodb itself not in model
                    localField: "user", // this is field in loan model -> in the bottom in pipeline _id to _id
                    // because its array and ussually that pipline is optional
                    
                    
                    foreignField: "_id", // this foreign id was in user model primary id
                    as: "user",
                    //control the join data parameters where id == id
                    pipeline: [
                        {$match: {$expr: {$eq: ['_id', '_id'] } }},
                        
                        // additional where filter the pipeline
                        // if the other table join have data equal
                        // user + role
                        // if role not match the role not populated returnning null
                        // {
                        //     $match: {
                        //         "name": "User"
                        //     }
                        // },  
                    ]
                    
                }
                
            },
            {   $unwind:"$user" },

            {
                $lookup: {
                    from: "books", //database name look for mongodb itself not in model
                    localField: "book", // this is field in loan model -> in the bottom in pipeline _id to _id
                    // because its array and ussually that pipline is optional
        
                    foreignField: "_id", // this foreign id was in book model primary id
                    as: "book",
                    //control the join data parameters where id == id
                    pipeline: [
                        {$match: {$expr: {$eq: ['_id', '_id']}}},
                    ]
                }
            },
            {   $unwind:"$book" },

            {
                $match: {$expr: {$eq: ['$user._id', { $toObjectId: userid } ]}}
            },

            {
                $project: {
                    _id: 1,
                    user: 1,
                    book: 1,
                    status: 1,
                    issue_date: 1,
                    due_date: 1,
                    return_date: 1
                    // count: { $size: "users" }
                }
            }
                
        ])
        .sort({status: 1})
        .skip(startIndex)
        .limit(limit)
        .exec();
        return result;
    }

    async AdminDashboardDatas() {
        return await Loan.aggregate([
            {
                $facet: {
                    "Loan_Count": [
                        { $count: "Total_Loans" },
                    ],
                    "Loan_Return": [
                        { $match : { status: 'return'}},
                        { $count: "Total_Loans_Return" },
                    ],
                    "Loan_Not_Return": [
                        { $match : { status: 'not return'}},
                        { $count: "Total_Loans_Not_Return" },
                    ]
                }
            },
            { $project: {
                //Books_Count: "$Books_Count.Total_Books", -> this return array the other version below was get array specific index
                Loan_Count: { "$arrayElemAt": ["$Loan_Count.Total_Loans", 0] },
                // Book_Available: "$Book_Available.Total_Books_Available",
                Loan_Return: { "$arrayElemAt": ["$Loan_Return.Total_Loans_Return", 0] },
                // Book_UnAvailable: "$Book_UnAvailable.Total_Books_UnAvailable",
                // Book_UnAvailable: { "$arrayElemAt": ["$Book_UnAvailable.Total_Books_UnAvailable", 0] },
                Loan_Not_Return: { "$arrayElemAt": ["$Loan_Not_Return.Total_Loans_Not_Return", 0] },
               
            }}
        ]);
    }

    async UserDashboardDatas(userid: string) {
        return await Loan.aggregate([
            {
                //user: { $toObjectId: userid } 
                $facet: {
                    "Loan_Count": [
                        { $match : {user: new mongoose.Types.ObjectId(userid) }},
                        { $count: "Total_Loans" },
                    ],
                    "Loan_Current": [
                        { $match : { status: 'not return', user: new mongoose.Types.ObjectId(userid) } },
                        { $count: "Total_Loans_Current" },
                    ]
                }
            },
            { $project: {
                //Books_Count: "$Books_Count.Total_Books", -> this return array the other version below was get array specific index
                Loan_Count: {
                    $cond: {
                        if:  {$gt: [ {$size: '$Loan_Count'}, 0 ]}, 
                        then: { "$arrayElemAt": ["$Loan_Count.Total_Loans", 0] },
                        else: 0 
                    }
                },
                
                Loan_Current: { 
                    $cond: {
                        if:  {$gt: [ {$size: '$Loan_Current'}, 0 ]}, 
                        then: { "$arrayElemAt": ["$Loan_Current.Total_Loans_Current", 0] },
                        else: 0 
                    } 
                },
            }}
        ]);
    }


    async loanUpdateDueDate(id: string) {
        let date = new Date(); // current time
        return await Loan.findOneAndUpdate({_id: id},  
            { 
                                  // date.toISOString('PST')
                $set: { return_date: date.toISOString(), status: 'return'}
            },
            {
                returnDocument: 'after'
            }
        )
        .populate('user', '-role').populate('book');
    }

    async loanValidateWarning(id: string) {
        return await Loan.findById(id).populate({path:'user', select:'warning'});
        // return await Loan.findById(id).populate([{path:'user', select:'warning'}, {path: 'book'}]);
    }

    async loanCreate(datas: Record<any, string|number|boolean|Array<any>>) {
        return await Loan.create(datas);
    }

    async countBookLoan(bookid: string) {
        // return await Loan.find({book: bookid}).count();
        return await Loan.find({book: new mongoose.Types.ObjectId(bookid)}).count();
        
    }

    async loanCountAll() {
        return await Loan.find().count();
    }

    async loanCountToReturn() {

    }

    async loanCountReturn() {
        
    }

}


export default new LoanClass();