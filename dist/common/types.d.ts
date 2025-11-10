export interface IPagination {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class IResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: IPagination;
    constructor(success: boolean, message: string, data?: T, pagination?: IPagination);
    static success<T>(message: string, data?: T, pagination?: IPagination): IResponse<T>;
}
