"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchRpcErrorsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const microservices_1 = require("@nestjs/microservices");
const client_1 = require("@prisma/client");
const prismaError_1 = require("../prismaError");
let CatchRpcErrorsInterceptor = class CatchRpcErrorsInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, rxjs_1.catchError)((error) => {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, prismaError_1.getPrismaErrorMessage)(error);
                const status = common_1.HttpStatus.BAD_REQUEST;
                return (0, rxjs_1.throwError)(() => new microservices_1.RpcException({ statusCode: status, message }));
            }
            return (0, rxjs_1.throwError)(() => new microservices_1.RpcException(error));
        }));
    }
};
exports.CatchRpcErrorsInterceptor = CatchRpcErrorsInterceptor;
exports.CatchRpcErrorsInterceptor = CatchRpcErrorsInterceptor = __decorate([
    (0, common_1.Injectable)()
], CatchRpcErrorsInterceptor);
//# sourceMappingURL=catch-async.decorator.js.map