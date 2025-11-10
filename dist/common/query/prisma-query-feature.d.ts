interface QueryOptions {
    search?: string;
    filter?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
    searchableFields?: string[];
    dateFields?: string[];
}
export declare class PrismaQueryFeature<TWhere extends Record<string, any>, TOrderBy extends Record<string, any>> {
    private options;
    private where;
    private orderBy;
    private skip;
    private take;
    constructor(options: QueryOptions);
    private buildWhere;
    private buildOrderBy;
    getQuery(): {
        skip: number;
        take: number;
        where: TWhere;
        orderBy: TOrderBy[];
    };
    getPagination(total: number): {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
export {};
