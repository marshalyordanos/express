import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class AllExceptions implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void;
}
