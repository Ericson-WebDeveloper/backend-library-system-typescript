import { RoleModel } from "./Role"

export interface UserDetailsModel {
    avatar?: string
    phone?: string
}

export interface UserTokenModel {
    value?: string
    expires?: Date
}
 
export interface UserModel {
    _id: string 
    firstname: string
    lastname: string
    middlename: string
    email: string
    password?: string
    details: UserDetailsModel
    role: string[] | RoleModel[]
    token?: UserTokenModel
    warning: number
    created_at: Date
    updated_at: Date
}