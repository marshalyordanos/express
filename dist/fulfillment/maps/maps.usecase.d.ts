import { ListQueryDto } from "../../common/query/query.dto";
export interface MapsUseCases {
    createDriverLocation(body: any): Promise<any>;
    createDriver(body: any): Promise<any>;
    getDrivers(query: ListQueryDto): Promise<any>;
    getDriverById(id: string): Promise<any>;
}
