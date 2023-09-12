

export interface BookModel {
    _id: string
    title: string
    isbn: string
    author: string
    status: 'available' | 'unavailable'
    categories:  Array<string>
    copies: number
    image: string
    created_at: Date
    updated_at?: Date
}


export interface IUpdateBookRequest {
    title: string
    isbn: string
    author: string
    categories: Array<string>
    copies: number
    status?: string
    image: string
}