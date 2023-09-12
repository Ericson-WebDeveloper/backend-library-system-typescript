import { Schema, model } from 'mongoose';

interface IRole {
    _id?: string
    name: string
}

const roleSchema = new Schema<IRole>({
  name: {type: String, required: true }, // String is shorthand for {type: String}
});

export default model<IRole>('Role', roleSchema);