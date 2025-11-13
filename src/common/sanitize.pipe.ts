import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  Scope,
} from '@nestjs/common';
import { escape } from 'lodash';
import { AppLogger } from './app-logger.service';

// Module-level sensitive fields
const SENSITIVE_FIELDS = [
  'password',
  'oldPassword',
  'newPassword',
  'token',
  'refreshToken',
];

// Patterns to neutralize (SQL, comments, suspicious keywords)
const SQL_PATTERNS: RegExp[] = [
  /(--|#).*/g,
  /\b(OR|AND)\b\s+\d+\s*=\s*\d+/gi,
  /;\s*$/g,
  /\/\*[\s\S]*?\*\//g,
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|EXECUTE)\b/gi,
];

// Basic XSS / HTML tag stripping
const XSS_TAGS =
  /\<(\/)?(script|style|iframe|object|embed|link|meta|form|input)[\s\S]*?\>/gi;

// Event handlers like onclick, onerror
const XSS_EVENT_ATTR = /\son\w+\s*=\s*(['"])[\s\S]*?\1/gi;

// Path traversal tokens
const PATH_TRAVERSAL = /\.\.\/|\.\.\\/g;

// Remove percent-encoded null / control
const PERCENT_NULL = /%00|%0d|%0a/gi;

// Remove non-printable control chars except tab/newline/CR
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g;

// Max string length
const MAX_STRING_LENGTH = 3000;

@Injectable({ scope: Scope.REQUEST })
export class SanitizePipe implements PipeTransform {
  constructor(private readonly logger: AppLogger) {
    try {
      this.logger?.setContext?.('Security', 'SanitizePipe');
    } catch (e) {
      console.warn('SanitizePipe: logger.setContext failed', e);
    }
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // SKIP if Multer file(s)
    if (this.isFilePayload(value, metadata)) return value;

    try {
      const sanitized = this.safeSanitize(value);

      if (!this.isBufferPayload(value)) {
        this.safeLog(value, sanitized, metadata);
      }

      return sanitized;
    } catch (err) {
      console.error('SanitizePipe unexpected error', err);
      return value;
    }
  }

  // --- Helpers ---
  private isFilePayload(value: any, metadata: ArgumentMetadata): boolean {
    if (!value || typeof value !== 'object') return false;

    // Check if it's a single file
    if (value.originalname && value.buffer && Buffer.isBuffer(value.buffer))
      return true;

    // Check if it's an array of files
    if (
      Array.isArray(value) &&
      value.every(
        (v) => v.originalname && v.buffer && Buffer.isBuffer(v.buffer),
      )
    )
      return true;

    return false;
  }

  private isBufferPayload(value: any): boolean {
    if (
      Array.isArray(value) &&
      value.length &&
      Buffer.isBuffer(value[0]?.buffer)
    ) {
      return true;
    }
    return false;
  }

  private safeSanitize(obj: any): any {
    try {
      return this.sanitize(obj);
    } catch {
      return obj;
    }
  }

  private sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') return this.sanitizeString(obj);
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.safeSanitize(item));

    if (typeof obj === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const key of Object.keys(obj)) {
        sanitizedObj[key] = this.safeSanitize(obj[key]);
      }
      return sanitizedObj;
    }

    return obj;
  }

  private sanitizeString(input: string): string {
    let s = input.normalize('NFKC');

    try {
      if (/%[0-9A-Fa-f]{2}/.test(s)) {
        s = decodeURIComponent(s);
      }
    } catch {}

    s = s
      .replace(PERCENT_NULL, ' ')
      .replace(CONTROL_CHARS, ' ')
      .replace(PATH_TRAVERSAL, ' ')
      .replace(XSS_TAGS, ' ')
      .replace(XSS_EVENT_ATTR, ' ');

    for (const patt of SQL_PATTERNS) {
      s = s.replace(patt, ' ');
    }

    s = s.replace(/\s+/g, ' ').trim();

    if (s.length > MAX_STRING_LENGTH) {
      s = s.slice(0, MAX_STRING_LENGTH);
    }

    return escape(s);
  }

  private safeMaskSensitiveFields(obj: any): any {
    try {
      return this.maskSensitiveFields(obj);
    } catch {
      return obj;
    }
  }

  private maskSensitiveFields(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj))
      return obj.map((item) => this.maskSensitiveFields(item));

    if (typeof obj === 'object') {
      const maskedObj: Record<string, any> = {};
      for (const key of Object.keys(obj)) {
        if (SENSITIVE_FIELDS.includes(key)) {
          maskedObj[key] = '****';
        } else {
          maskedObj[key] = this.maskSensitiveFields(obj[key]);
        }
      }
      return maskedObj;
    }

    return obj;
  }

  private safeJSON(value: any): string {
    try {
      return JSON.stringify(value, (key, val) => {
        if (Buffer.isBuffer(val)) return `[Buffer length: ${val.length}]`;
        if (val && typeof val === 'object' && Object.keys(val).length > 50)
          return '[Object too large]';
        return val;
      });
    } catch {
      return '[Unserializable]';
    }
  }

  private safeLog(original: any, sanitized: any, metadata: ArgumentMetadata) {
    if (JSON.stringify(original) !== JSON.stringify(sanitized)) {
      const masked = this.safeMaskSensitiveFields(sanitized);
      if (this.logger?.warn) {
        this.logger.warn(
          `[Sanitized] Type: ${metadata.type} | Data before: ${this.safeJSON(original)} | After: ${this.safeJSON(masked)}`,
        );
      } else {
        console.debug('[Sanitized]', metadata.type, masked);
      }
    }
  }
}
