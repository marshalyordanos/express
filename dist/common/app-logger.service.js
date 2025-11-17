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
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const dynamic_logger_util_1 = require("./dynamic-logger.util");
let AppLogger = class AppLogger {
    constructor() {
        this.logger = (0, dynamic_logger_util_1.createServiceLogger)('App', 'General');
        const serviceName = this.constructor.name.replace('Service', '');
        this.logger = (0, dynamic_logger_util_1.createServiceLogger)(serviceName, 'DefaultModule');
    }
    setContext(serviceName, moduleName) {
        this.logger = (0, dynamic_logger_util_1.createServiceLogger)(serviceName, moduleName);
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message + (trace ? `\n${trace}` : ''), { context });
    }
    verbose(message, context) {
        this.logger.verbose
            ? this.logger.verbose(message, { context })
            : this.logger.debug(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppLogger);
//# sourceMappingURL=app-logger.service.js.map