// common/utils/nest-system-logger.util.ts
import { LoggerService, LogLevel } from '@nestjs/common';
import { createServiceLogger, ServiceLogger } from './dynamic-logger.util';

export class NestSystemLogger implements LoggerService {
  private systemLogger: ServiceLogger;

  constructor(serviceName = 'App', moduleName = 'System') {
    this.systemLogger = createServiceLogger(serviceName, moduleName);
  }

  log(message: any, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    console.log(msg); // keep default console output
    this.systemLogger.system?.(msg); // store in system log file
  }

  error(message: any, trace?: string, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    console.error(msg);
    if (trace) console.error(trace);
    this.systemLogger.error(msg); // also store in error file
  }

  warn(message: any, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    console.warn(msg);
    this.systemLogger.warn(msg); // store in warn file
  }

  debug?(message: any, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    console.debug(msg);
    this.systemLogger.debug(msg); // store in debug file
  }

  verbose?(message: any, context?: string) {
    const msg = context ? `[${context}] ${message}` : message;
    console.log(msg);
    this.systemLogger.log(msg); // store in info file
  }
}
