import User from '../model/User';
import Book from '../model/Books';
import { BookModel } from '../Types/Book';


interface ISearchInputs {
    title: string, isbn: string, author:string, status: string
}

class BookClass {

    // create index in serach 
    // last step

    async addBook(datas: Record<any, string|number|Date|Array<any>>) {
        return await Book.create(datas);
    }

    returnField (object: any) {
        let keys = Object.keys(object);
        let params: Array<any> = [];
        keys.forEach((k: string, index) => {
            if(object[k] != '') {
                // let obj = {[k]: object[k]}
                // https://www.edureka.co/community/180627/typescript-element-implicitly-because-expression-number
                params[<any>k] = object[k]
            }

        })
        return params;
    }

    returnQuery(arrayInput: any) {
        if(Object.keys(arrayInput).length  <= 0) {
            return '';
        } else {
            let query;
            let searchquery = Object.keys(arrayInput).map((key) => {
                let val = `.*${arrayInput[key]}`;
                return  { [key]: arrayInput[key] ? { $regex: val, $options:  'i' } : '' }
            });
            query = searchquery.length > 0 ? {$or: [...searchquery]} : ''
            return query;
        }
    }

    returnQueryCondRegex(input: string, fieldName: string) {
        if(input || input != '') {
           return { [fieldName]: { $regex: `.*${input}`, $options:  'i' }  } 
        } else {
            return {};
        }
        
    }

    returnQueryCondMatch(input: string, fieldName: string) {
        if(input || input != '') {
           return { [fieldName]: input } 
        } else {
            return {};
        }
        
    }

    returnOnlyHaveValue(queryExp: any) {
        console.log(Object.keys(queryExp));
    }

    async queryWithAggregate(searchInputs: {title: string, isbn: string, author:string, status: string}|null, startIndex = 0, limit = 2)
    : Promise<BookModel[]> {
        if(!searchInputs) {
            // return {$match};
            const books = await Book.find().sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
            return books
        } else if(searchInputs.title == '' && searchInputs.isbn == '' && searchInputs.author == '' && searchInputs.status == '') {
            // return {$match};
            return await Book.find().sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
        } else {
            // https://www.appsloveworld.com/mongodb/100/47/optional-parameters-in-mongodb
            let conditions = [];
            if(searchInputs.title != '') {
                conditions.push({ title: { $regex: `.*${searchInputs.title}.*`, $options:  'i' } });
            }
            if(searchInputs.isbn != '') {
                conditions.push({ isbn: { $regex: `.*${searchInputs.isbn}.*`, $options:  'i' } });
            }
            if(searchInputs.author != '') {
                conditions.push({ author: { $regex: `.*${searchInputs.author}.*`, $options:  'i' } });
            }
            if(searchInputs.status != '') {
                conditions.push({ status:  searchInputs.status});
            }

            let final_condition = conditions.length ? conditions : conditions;
            const books = await Book.aggregate([
                {
                    $match: {
                        $or: final_condition
                    }
                }
            ]).sort("-_id")
                .skip(startIndex)
                .limit(limit)
                .exec();
            return books;
          
        }
    }

    async querySearchCount(searchInputs: ISearchInputs|null) {
        if(!searchInputs) {
            // return {$match};
            return await Book.find({}).count();
        } else if(searchInputs?.title == '' && searchInputs?.isbn == '' && searchInputs?.author == '' && searchInputs?.status == '') {
            // return {$match};
            return await Book.find({}).count();
        } else {
            // https://www.appsloveworld.com/mongodb/100/47/optional-parameters-in-mongodb
            let conditions = [];
            if(searchInputs.title != '') {
                conditions.push({ title: { $regex: `.*${searchInputs.title}.*`, $options:  'i' } });
            }
            if(searchInputs.isbn != '') {
                conditions.push({ isbn: { $regex: `.*${searchInputs.isbn}.*`, $options:  'i' } });
            }
            if(searchInputs.author != '') {
                conditions.push({ author: { $regex: `.*${searchInputs.author}.*`, $options:  'i' } });
            }
            if(searchInputs.status != '') {
                conditions.push({ status:  searchInputs.status});
            }
            let final_condition = conditions.length ? conditions : [];
            return await Book.find({
                // $and: final_condition August 16 2023
                $or: final_condition
            }).count();
          
        }
    }

    async books(pageNumber: number, limit: number, search: ISearchInputs | null = null) {
        let result: {totalDatas: number, totalPage: number, previous: null|{ pageNumber: number|null, limit: number}, 
            next: { pageNumber: number, limit: number } | null, 
            currePage: number, rowsPerPage: number, data: BookModel[]} = {
            totalDatas: 0,
            totalPage: 0,
            previous: null,
            next: null,
            currePage: 0,
            rowsPerPage: 0,
            data: []
        };
        let totalDatas = await this.querySearchCount(search!);
        let startIndex = (pageNumber - 1) * limit;
        let endIndex = (pageNumber + 1) * limit;
        result.totalDatas = totalDatas;
        result.totalPage = Math.ceil(totalDatas / limit)

        result.previous = startIndex > 0 ? { pageNumber: (pageNumber - 1 === 0) ? null : pageNumber - 1 , limit: limit } : null ;
        // result.next = endIndex < (await Book.find().count()) ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.next = endIndex < totalDatas ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.currePage = pageNumber;
        result.rowsPerPage = limit;

        result.data = await this.queryWithAggregate(search, startIndex, limit)

        return result;
    }

    async bookSearch(searchs: any) {
        return await Book.find({...searchs});
    }

    

    async booksDashBoardAdmin() {
        return await Book.aggregate([
            {
                $facet: {

                    "Books_Count": [
                        { $count: "Total_Books" },
                    ],
                    "Book_Available": [
                        { $match : { status: 'available'}},
                        { $count: "Total_Books_Available" },
                    ],
                    "Book_UnAvailable": [
                        { $match : { status: 'unavailable'}},
                        { $count: "Total_Books_UnAvailable" },
                    ]
                }
            },
            { $project: {
                //Books_Count: "$Books_Count.Total_Books", -> this return array the other version below was get array specific index
                Books_Count: { "$arrayElemAt": ["$Books_Count.Total_Books", 0] },
                // Book_Available: "$Book_Available.Total_Books_Available",
                Book_Available: { "$arrayElemAt": ["$Book_Available.Total_Books_Available", 0] },
                // Book_UnAvailable: "$Book_UnAvailable.Total_Books_UnAvailable",
                // Book_UnAvailable: { "$arrayElemAt": ["$Book_UnAvailable.Total_Books_UnAvailable", 0] },
                Book_UnAvailable: {
                    $cond: {
                        if:  {$gt: [ {$size: '$Book_UnAvailable'}, 0 ]}, 
                        then: { "$arrayElemAt": ["$Book_UnAvailable.Total_Books_UnAvailable", 0] },
                        else: 0 
                     }
                }
               
            }}
            
        ]);
    }

    async bookSearching(search: string) {
        return await Book.find({ $or: [
            { title: {$regex : `.*${search}`, $options:  'i'}},
            { isbn: {$regex : `.*${search}`, $options:  'i'}},
            { author: {$regex : `.*${search}`, $options:  'i'}},
        ]});
    }

    async bookFind(id: string) {
        return await Book.findById(id);
    }

    async booksAvailable() {
        return await Book.find({copies: {$gt: 0}});
    }

    async booksUnAvailable() {
        return await Book.find({copies: {$lt: 1}});
    }

    async bookUpdate(datas: Record<any, string|number|Date|Array<any>|undefined>) {
        const {id} = datas;
        datas.id = undefined;
        return await Book.findOneAndUpdate(
            {_id:id},
            ///datas,
            { $set: { ...datas }},
            {
                returnDocument: 'after'
            }
            // projection: { "assignment" : 1, "points" : 1 } // costum return data fields
        );
    }

    async bookRemove(id: string) {
        return await Book.findOneAndDelete(
            {_id: id}
        );
    }

    async bookBorrowed(id: string) {
        return await Book.findOneAndUpdate(
            {_id:id},
            { 
                $inc : { "copies" : -1 },
            },
            {
                returnDocument: "after"
            }
        );
    }

    async bookReturn(id: string) {
        return await Book.findOneAndUpdate(
            {_id:id},
            { $inc : { "copies" : 1 } },
            {
                returnDocument: 'after'
            }
            // { $set: { "name" : "A.B. Abracus", "assignment" : 5}, $inc : { "points" : 5 } },
            // projection: { "assignment" : 1, "points" : 1 } // costum return data fields
        );
    }

    async bookUpdateStatus(id: string, status: string) {
        return await Book.findOneAndUpdate(
            {_id: id},
            { $set: { status: status}},
            {
                returnDocument: 'after'
            }
            // projection: { "assignment" : 1, "points" : 1 } // costum return data fields
        );
    }

}


 export default new BookClass()
