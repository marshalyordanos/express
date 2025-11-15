import { DispatchRepository } from './dispatch.repository';
import { AppLogger } from '../../common/app-logger.service';
export declare class DispatchScheduler {
    private readonly dispatchRepo;
    private readonly logger;
    constructor(dispatchRepo: DispatchRepository, logger: AppLogger);
    autoExpire(): Promise<void>;
}
