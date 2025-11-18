import { Inject, Injectable, Scope } from '@nestjs/common';
import { createServiceLogger } from './dynamic-logger.util';
import { Logger } from 'winston';
import { CONTEXT } from '@nestjs/microservices';

/**
 * A universal logger wrapper that matches NestJS Logger API
 * but internally uses our Winston + DailyRotate logger.
 */
@Injectable()
export class AppLogger {
  private logger: Logger;

  //   constructor() {
  //     // Default fallback (will be overridden by setContext)
  //       this.logger = createServiceLogger('App', 'General');

  // }
  // constructor() {
  //   this.logger = createServiceLogger('App', 'General');
  //   const serviceName = this.constructor.name.replace('Service', '');
  //   this.logger = createServiceLogger(serviceName, 'DefaultModule');
  // }

  /**
   * Set logger context dynamically (e.g. service and module)
   */
  // setContext(serviceName: string, moduleName: string) {
  //   this.logger = createServiceLogger(serviceName, moduleName);
  // }

  // Match NestJS Logger methods — same names
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message + (trace ? `\n${trace}` : ''), { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose
      ? this.logger.verbose(message, { context })
      : this.logger.debug(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
