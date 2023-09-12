import { Schema, model, Types } from 'mongoose';

interface IBook {
    _id?: string
    title: string
    isbn: string
    author: string
    status: 'available' | 'unavailable'
    categories:  Array<string>
    copies: number
    image: string
    created_at: Date
    updated_at?: Date
    // Use `Types.ObjectId` in document interface...
    // organization: Types.ObjectId
  }

const bookSchema = new Schema<IBook>({
    title: {type: String, required: true},
    isbn: {type: String, required: true}, // String is shorthand for {type: String}
    // category
    author: {type: String, required: true}, 
    status: { 
        type: String,
        enum: [ 'available', 'unavailable' ],
        default: 'available'
    },
    categories: { 
        type: [String],
        required: true
        // Math, Science, English, Physic, Biology, History, P.E, Sports and leisure, 
    },
    copies: { type: Number, required: true },
    image: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date}
});

export default model<IBook>('Book', bookSchema);