export declare class ReportMessageController {
    getBranchDetails(payload: {
        branchId: string;
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getDriverOverview(payload: {
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getDriverDetails(payload: {
        driverId: string;
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getTopBranches(payload: {
        metric: string;
        headers: {
            authorization: string;
        };
    }): Promise<void>;
    getTopDrivers(payload: {
        metric: string;
        headers: {
            authorization: string;
        };
    }): Promise<void>;
}
