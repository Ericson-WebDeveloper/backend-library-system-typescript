import { Schema, model, Types } from 'mongoose';

interface ILoan {
    _id?: string
    user: Types.ObjectId
    book: Types.ObjectId
    status: 'return' | 'not return'
    issue_date: Date,
    due_date?: Date
    return_date?: Date
}

const loanSchema = new Schema<ILoan>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true}, // String is shorthand for {type: String}
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true}, 
    status: { 
        type: String,
        // reserve
        // minus copies -> status not return if confirm by librarian
        enum : ['return','not return'],
        default: 'not return'
    },
    issue_date: { type: Date, default: Date.now },
    due_date: { type: Date },
    return_date: { type: Date },
});

export default model<ILoan>('Loan', loanSchema);