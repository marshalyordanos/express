import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';
import { escape } from 'lodash';
import { AppLogger } from './app-logger.service';

@Injectable()
export class SanitizePipe implements PipeTransform {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('Security', 'SanitizePipe');
  }
  // Fields to mask in logs
  private readonly sensitiveFields = [
    'password',
    'oldPassword',
    'newPassword',
    'token',
    'refreshToken',
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') return this.sanitize(value);

    const sanitized = this.sanitize(value);

    // Optional logging with masked sensitive fields
    if (JSON.stringify(value) !== JSON.stringify(sanitized)) {
      const masked = this.maskSensitiveFields(sanitized);
      this.logger.debug(
        `[Sanitized] Type: ${metadata.type} | Data after sanitization: ${JSON.stringify(
          masked,
        )}`,
      );
    }

    return sanitized;
  }

  private sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return escape(obj.trim().replace(/\s+/g, ' '));
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitizedObj[key] = this.sanitize(obj[key]);
        }
      }
      return sanitizedObj;
    }

    return obj;
  }

  private maskSensitiveFields(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj))
      return obj.map((item) => this.maskSensitiveFields(item));

    if (typeof obj === 'object') {
      const maskedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (this.sensitiveFields.includes(key)) {
            maskedObj[key] = '****'; // mask sensitive value
          } else {
            maskedObj[key] = this.maskSensitiveFields(obj[key]);
          }
        }
      }
      return maskedObj;
    }

    return obj;
  }
}
