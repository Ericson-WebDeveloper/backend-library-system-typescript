import { IResponseDataWithPages } from '../Types/Helper';
import { UserModel } from '../Types/User';
import User from '../model/User';

class UserCLass {

    async register(datas: Omit<UserModel, '_id'|'token'|'created_at'|'updated_at'|'warning'>) {
        return await User.create(datas);
    }

    async userRollback(id: string) {
        return await User.findByIdAndRemove(id);
    }

    async users(pageNumber: number, limit: number, searchInputs: Record<any,string> | null = null){
        let result: IResponseDataWithPages<UserModel> = {
            totalDatas: 0,
            totalPage: 0,
            previous: null,
            next: null,
            currePage: 0,
            rowsPerPage: 0,
            data: []
        }
        let User_count = await this.userCount('User', searchInputs);
        // const totalDatas = await User.find({}).count();
        // https://www.youtube.com/watch?v=ja4yIn2pCzw
        // https://github.com/TomDoesTech/mongodb-react-pagination/blob/main/server/src/index.js
        let startIndex = (pageNumber - 1) * limit;
        const endIndex = (pageNumber + 1) * limit;
        result.totalDatas = User_count;
        result.totalPage = Math.ceil(User_count / limit)

        result.previous = startIndex > 0 ? { pageNumber: (pageNumber - 1 === 0) ? null : pageNumber - 1 , limit: limit } : null ;
        // result.next = endIndex < (await User.find().count()) ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.next = endIndex < User_count ? { pageNumber: pageNumber + 1, limit: limit } : null;
        result.currePage = pageNumber;
        result.rowsPerPage = limit;

        let conditions = [];
        if(searchInputs && searchInputs.fullname != '') {
            conditions.push({ fullname: { $regex: `.*${searchInputs.fullname}.*`, $options:  'i' } });
            // conditions.push({ firstname: { $regex: `.*${searchInputs.fullname}`, $options:  'i' } });
            // conditions.push({ middlename: { $regex: `.*${searchInputs.fullname}`, $options:  'i' } });
            // conditions.push({ lastname: { $regex: `.*${searchInputs.fullname}`, $options:  'i' } });
        }

        if(searchInputs && searchInputs.email != '') {
            conditions.push({ email: { $regex: `.*${searchInputs.email}.*`, $options:  'i' } });
        }

        conditions.push({ 'role.name': "User" });

        let final_condition = conditions.length ? conditions : [];

        result.data = await User.aggregate([
            {
                $addFields: {
                    "fullname": { $concat: ["$firstname", " ", "$middlename", ". ", "$lastname"] },
                }
            },

            {
                $lookup: {
                    from: "roles", //database name look for mongodb itself not in model
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                    //control the join data parameters where id == id
                    pipeline: [
                        {$match: {$expr: {$eq: ['_id', '_id'] } } },  
                    ]
                    
                }
            },
            {
                $match: {
                    // "role.name": "User"
                    $and: final_condition
                },
            },
           
            {
                $project: {
                    _id: 1,
                    firstname: 1,
                    lastname: 1,
                    middlename: 1,
                    email: 1,
                    warning: 1,
                    details: 1,
                    role: 1,
                    created_at: 1,
                    fullname: 1
                }
            }
        ])
            .sort({_id: -1})
            .skip(startIndex)
            .limit(limit)
            .exec();
  
        return result;
    }

    async userSearching(search: string, type: string) {
        return await User.aggregate([
            {
                $lookup: {
                    from: "roles", //database name look for mongodb itself not in model
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                    //control the join data parameters where id == id
                    pipeline: [
                        {
                            $match: { 
                                $expr: { 
                                    $eq: ['_id', '_id']
                                } 
                            }
                        },
                    ]
                }
            },
            {
                $match: {
                    $or: [
                        // { firstname: {$regex : `.*${search}`, $options:  'i'}},
                        // { lastname: {$regex : `.*${search}`, $options:  'i'}},
                        // { middlename: {$regex : `.*${search}`, $options:  'i'}},
                        { email: {$regex : `.*${search}`, $options:  'i'}},
                        // { "role.name": type }
                    ],
                   $and: [ {"role.name": type} ]
                }
            },
            {
                $project: {
                    _id: 1,
                    firstname: 1,
                    lastname: 1,
                    middlename: 1,
                    email: 1,
                    details: 1
                    // count: { $size: "users" }
                }
            }
                
        ])
    }

    async userCount(type: string, searchInputs: Record<any,string>|null = null) {
        let conditions = [];
        if(searchInputs && searchInputs.fullname != '') {
            conditions.push({ fullname: { $regex: `.*${searchInputs.fullname}.*`, $options:  'i' } });
        }

        if(searchInputs && searchInputs.email != '') {
            conditions.push({ email: { $regex: `.*${searchInputs.email}.*`, $options:  'i' } });
        }

        conditions.push({ 'role.name': type });
        
        let final_condition = conditions.length ? conditions : [];

        let c = await User.aggregate([
            {
                $lookup: {
                    from: "roles", //database name look for mongodb itself not in model
                    localField: "role", // local field in user model
                    foreignField: "_id", // in role model
                    as: "role",
                    //control the join data parameters where id == id
                    pipeline: [
                            {$match: {$expr: {$eq: ['_id', '_id']}}},
                        //     {
                        //         $match: {
                        //             "role.name": type
                        //     }
                        // },  
                    ]
                    
                }
            },
            {
                $addFields: {
                    "fullname": {$concat: ["$firstname", " ", "$middlename", ". ", "$lastname"]},
                }
            },
            {
                $match: {
                    // "role.name": type
                    $and: final_condition
                },
            },
            {
                $count: `${type}_count`
            }
        ]);

        return c.length > 0 ? c[0][`${type}_count`] : 0;

    }

    async findByEmailUser(email: string) {
        return await User.findOne({email:email}).select('-password').populate({path: 'role'});
    }

    async findByEmailUserAuth(email: string){
        return await User.findOne({email:email}).select('-token').populate({path: 'role'});
    }

    async findByObjectId(id: string){
        return await User.findById(id);
    }

    async userFindById(id: string){
        return await User.findById(id).select('-password').populate({path: 'role'});
    }

    async updateDetail(datas: Record<any, string|number|boolean|Array<any>>, userObj: typeof User) {
        return await userObj.updateOne({...datas});
    }

    async createToken(id: string, token: string) {// debugging
        let date = new Date(); // current time
        return await User.findOneAndUpdate({_id: id}, {"token.value": token, "token.expires": 
        // date.toISOString('en-Us', {timeZone: 'Asia/Manila'})
        new Date(date.toLocaleString("en-US", {timeZone: "Asia/Manila"}))
    }, 
        {
            returnDocument: 'after'
        });
    }

    async revokeToken(id: string) {// debugging
        return await User.findOneAndUpdate({_id: id}, {"token.value": '', "token.expires": ''}, 
        {
            returnDocument: 'after'
        });
    }

    async updateProfile(id: string, datas: Record<any, string|number|boolean|Array<any>|any>) {
        return await User.findOneAndUpdate({_id: id}, {$set:{ ...datas }}, {returnDocument: 'after'}).populate('role');
    }

    async userResetWarning(id: string) {
        return await User.findOneAndUpdate({_id: id}, {$set:{ warning: 0 }}).select('-password').populate('role');
    }

    async userIncWarning(id: string) {
        return await User.findOneAndUpdate({_id: id}, { $inc:{ warning: 1 } }).select('-password').populate('role');
    }

    async userDecrWarning(id: string) {
        return await User.findOneAndUpdate({_id: id}, {$inc:{ warning: -1 }}).select('-password').populate('role');
    }
 
    async updateProfileAvatar(id: string, avatar: string) {
        return await User.findOneAndUpdate({_id: id}, {$set:{ 'details.avatar': avatar }}, {returnDocument: 'after'}).populate('role');
    }

    async updateAvatar(userObj: typeof User, avatar: string) {
        return await userObj.updateOne({avatar:avatar});
    }

    async getAllUsers(type: string) {
        // return await User.find().populate({path: 'role', match: { 'name': type }}).exec();
        // let users = await User.find({}).populate({path: 'role'}).exec();
        // //return await User.find({"role.name": {name: type}}).count();
        // return users.map((user) => {
        //     return user.role.map((rol) => {
        //         if(rol.name == type) {
        //             return user;
        //         }
        //     })
        // });

        // return await User.find('role': { "$ref" : 'role', "$name" : type , "$db" :'test' }).count();
// https://mongoplayground.net/p/hGQFhkoujsC
        return await User.aggregate([
            {
                $lookup: {
                    from: "roles", //database name look for mongodb itself not in model
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                    //control the join data parameters where id == id
                    pipeline: [
                        {$match: {$expr: {$eq: ['_id', '_id']}}},

                        // additional where filter the pipeline
                        // if the other table join have data equal
                        // user + role
                        // if role not match the role not populated returnning null
                        {
                            $match: {
                                "name": type
                        }},  
                    ]
                    
                }
                
            },
            // {
            //     $unwind: "$role",  
            // },

            // which is final returning data
            {
                $match: {
                    // if role null cannot return data
                    // important return all data has role equal to parameters
                    "role": {"$ne": []}
                } 
            },
            {
                $project: {
                    _id: 1,
                    firstname: 1,
                    "role.name": 1,
                    // count: { $size: "users" }
                }
            },
            // count all return data
            {
                $count: `${type}_count`
            }
                
        ])
    }

}

export default new UserCLass()