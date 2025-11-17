import { Logger } from 'winston';
export interface ServiceLogger extends Logger {
    system?: (msg: string) => void;
}
export declare function createServiceLogger(serviceName: string, moduleName: string): ServiceLogger;
