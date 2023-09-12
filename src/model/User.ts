import { Schema, model, Types } from 'mongoose';


interface IUserDetails {
    avatar?: string
    phone?: string
}

interface IUserToken {
    value?: string
    expires?: Date
}

interface IUser {
     _id?: string
    firstname: string
    lastname: string
    middlename: string
    email: string
    password: string
    details: IUserDetails
    role: Types.ObjectId[]
    token?: IUserToken
    warning: number
    created_at: Date
    updated_at: Date
}

const userSchema = new Schema<IUser>({
  firstname: {type: String, required: true }, // String is shorthand for {type: String}
  lastname: {type: String, required: true}, 
  middlename: {type: String, required: true}, 
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  details: {
    avatar: {type: String},
    phone: {type: String}
  },
  role: [
    {type: Schema.Types.ObjectId, ref: 'Role'}
  ],
  token: {
    value: {type: String},
    expires: {type: Date},
  },
  warning: {type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default model<IUser>('User', userSchema);