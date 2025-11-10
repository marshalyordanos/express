import { LoggerService } from '@nestjs/common';
export declare class NestSystemLogger implements LoggerService {
    private systemLogger;
    constructor(serviceName?: string, moduleName?: string);
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug?(message: any, context?: string): void;
    verbose?(message: any, context?: string): void;
}
