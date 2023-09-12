import { UserModel } from "../Types/User";
import RoleClass from "../class/RoleClass";
import { hashPass } from "../helper/IndexHelper";
import User from "../model/User";

export const createUser = async (
  user: Omit<
    UserModel,
    "_id" | "token" | "warning" | "created_at" | "updated_at" 
  >
) => {
  try {
    let data = {
      ...user,
      password: await hashPass(user.password as string)
    };
    return await User.create(data);
  } catch (error: any) {
    return null;
  }
};

// export const createAdmin = () => {};
