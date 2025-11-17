"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizePipe = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const app_logger_service_1 = require("./app-logger.service");
const SENSITIVE_FIELDS = [
    'password',
    'oldPassword',
    'newPassword',
    'token',
    'refreshToken',
];
const SQL_PATTERNS = [
    /(--|#).*/g,
    /\b(OR|AND)\b\s+\d+\s*=\s*\d+/gi,
    /;\s*$/g,
    /\/\*[\s\S]*?\*\//g,
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|EXECUTE)\b/gi,
];
const XSS_TAGS = /\<(\/)?(script|style|iframe|object|embed|link|meta|form|input)[\s\S]*?\>/gi;
const XSS_EVENT_ATTR = /\son\w+\s*=\s*(['"])[\s\S]*?\1/gi;
const PATH_TRAVERSAL = /\.\.\/|\.\.\\/g;
const PERCENT_NULL = /%00|%0d|%0a/gi;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g;
const MAX_STRING_LENGTH = 3000;
let SanitizePipe = class SanitizePipe {
    constructor(logger) {
        this.logger = logger;
        try {
            this.logger?.setContext?.('Security', 'SanitizePipe');
        }
        catch (e) {
            console.warn('SanitizePipe: logger.setContext failed', e);
        }
    }
    transform(value, metadata) {
        if (this.isFilePayload(value, metadata))
            return value;
        try {
            const sanitized = this.safeSanitize(value);
            if (!this.isBufferPayload(value)) {
                this.safeLog(value, sanitized, metadata);
            }
            return sanitized;
        }
        catch (err) {
            console.error('SanitizePipe unexpected error', err);
            return value;
        }
    }
    isFilePayload(value, metadata) {
        if (!value || typeof value !== 'object')
            return false;
        if (value.originalname && value.buffer && Buffer.isBuffer(value.buffer))
            return true;
        if (Array.isArray(value) &&
            value.every((v) => v.originalname && v.buffer && Buffer.isBuffer(v.buffer)))
            return true;
        return false;
    }
    isBufferPayload(value) {
        if (Array.isArray(value) &&
            value.length &&
            Buffer.isBuffer(value[0]?.buffer)) {
            return true;
        }
        return false;
    }
    safeSanitize(obj) {
        try {
            return this.sanitize(obj);
        }
        catch {
            return obj;
        }
    }
    sanitize(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj === 'string')
            return this.sanitizeString(obj);
        if (typeof obj === 'number' || typeof obj === 'boolean')
            return obj;
        if (Array.isArray(obj))
            return obj.map((item) => this.safeSanitize(item));
        if (typeof obj === 'object') {
            const sanitizedObj = {};
            for (const key of Object.keys(obj)) {
                sanitizedObj[key] = this.safeSanitize(obj[key]);
            }
            return sanitizedObj;
        }
        return obj;
    }
    sanitizeString(input) {
        let s = input.normalize('NFKC');
        try {
            if (/%[0-9A-Fa-f]{2}/.test(s)) {
                s = decodeURIComponent(s);
            }
        }
        catch { }
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
        return (0, lodash_1.escape)(s);
    }
    safeMaskSensitiveFields(obj) {
        try {
            return this.maskSensitiveFields(obj);
        }
        catch {
            return obj;
        }
    }
    maskSensitiveFields(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (Array.isArray(obj))
            return obj.map((item) => this.maskSensitiveFields(item));
        if (typeof obj === 'object') {
            const maskedObj = {};
            for (const key of Object.keys(obj)) {
                if (SENSITIVE_FIELDS.includes(key)) {
                    maskedObj[key] = '****';
                }
                else {
                    maskedObj[key] = this.maskSensitiveFields(obj[key]);
                }
            }
            return maskedObj;
        }
        return obj;
    }
    safeJSON(value) {
        try {
            return JSON.stringify(value, (key, val) => {
                if (Buffer.isBuffer(val))
                    return `[Buffer length: ${val.length}]`;
                if (val && typeof val === 'object' && Object.keys(val).length > 50)
                    return '[Object too large]';
                return val;
            });
        }
        catch {
            return '[Unserializable]';
        }
    }
    safeLog(original, sanitized, metadata) {
        if (JSON.stringify(original) !== JSON.stringify(sanitized)) {
            const masked = this.safeMaskSensitiveFields(sanitized);
            if (this.logger?.warn) {
                this.logger.warn(`[Sanitized] Type: ${metadata.type} | Data before: ${this.safeJSON(original)} | After: ${this.safeJSON(masked)}`);
            }
            else {
                console.debug('[Sanitized]', metadata.type, masked);
            }
        }
    }
};
exports.SanitizePipe = SanitizePipe;
exports.SanitizePipe = SanitizePipe = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __metadata("design:paramtypes", [app_logger_service_1.AppLogger])
], SanitizePipe);
//# sourceMappingURL=sanitize.pipe.js.map