"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestSystemLogger = void 0;
const dynamic_logger_util_1 = require("./dynamic-logger.util");
class NestSystemLogger {
    constructor(serviceName = 'App', moduleName = 'System') {
        this.systemLogger = (0, dynamic_logger_util_1.createServiceLogger)(serviceName, moduleName);
    }
    log(message, context) {
        const msg = context ? `[${context}] ${message}` : message;
        console.log(msg);
        this.systemLogger.system?.(msg);
    }
    error(message, trace, context) {
        const msg = context ? `[${context}] ${message}` : message;
        console.error(msg);
        if (trace)
            console.error(trace);
        this.systemLogger.error(msg);
    }
    warn(message, context) {
        const msg = context ? `[${context}] ${message}` : message;
        console.warn(msg);
        this.systemLogger.warn(msg);
    }
    debug(message, context) {
        const msg = context ? `[${context}] ${message}` : message;
        console.debug(msg);
        this.systemLogger.debug(msg);
    }
    verbose(message, context) {
        const msg = context ? `[${context}] ${message}` : message;
        console.log(msg);
        this.systemLogger.log(msg);
    }
}
exports.NestSystemLogger = NestSystemLogger;
//# sourceMappingURL=nest-system-logger.util.js.map