"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptions = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const types_1 = require("./types");
let AllExceptions = class AllExceptions {
    catch(exception, host) {
        const ctxType = host.getType();
        let status = exception?.statusCode ||
            exception?.error?.statusCode ||
            common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = exception?.message || 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            message = exception.message;
        }
        else if (exception instanceof microservices_1.RpcException) {
            const rpcError = exception.getError();
            status = rpcError?.statusCode || status;
            message = rpcError?.message || message;
        }
        if (exception instanceof common_1.BadRequestException) {
            const response = exception.getResponse();
            message =
                typeof response === 'string'
                    ? response
                    : response?.message || exception.message;
        }
        if (ctxType === 'http') {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse();
            response.status(status).json(new types_1.IResponse(false, message, null, null));
        }
        if (ctxType === 'rpc') {
            throw exception;
        }
    }
};
exports.AllExceptions = AllExceptions;
exports.AllExceptions = AllExceptions = __decorate([
    (0, common_1.Catch)()
], AllExceptions);
//# sourceMappingURL=error.js.map