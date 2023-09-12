

export interface IResponseDataWithPages<T> {
    totalDatas: number, 
    totalPage: number, 
    previous: null| { pageNumber: number|null, limit: number}, 
    next: {pageNumber: number, limit: number} | null, 
    currePage: number, 
    rowsPerPage: number, 
    data: T[]
}