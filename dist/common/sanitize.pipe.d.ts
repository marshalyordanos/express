import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
export declare class SanitizePipe implements PipeTransform {
    private readonly logger;
    constructor(logger: AppLogger);
    transform(value: any, metadata: ArgumentMetadata): any;
    private isFilePayload;
    private isBufferPayload;
    private safeSanitize;
    private sanitize;
    private sanitizeString;
    private safeMaskSensitiveFields;
    private maskSensitiveFields;
    private safeJSON;
    private safeLog;
}
