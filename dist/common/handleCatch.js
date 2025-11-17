"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCatch = handleCatch;
const client_1 = require("@prisma/client");
const prismaError_1 = require("./prismaError");
const microservices_1 = require("@nestjs/microservices");
function handleCatch(error) {
    let message = 'Internal server error';
    let statusCode = 500;
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        message = (0, prismaError_1.getPrismaErrorMessage)(error);
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        const msg = error.message;
        if (msg.includes('Argument')) {
            message = msg.split('Argument')[1].trim();
        }
        else {
            message = msg;
        }
    }
    else if (error instanceof Error) {
        message = error.message;
    }
    if (error instanceof microservices_1.RpcException) {
        const err = error.getError();
        statusCode = err?.statusCode || 500;
        message = err?.message || 'Unknown RPC error';
        throw new microservices_1.RpcException({ statusCode, message });
    }
    throw new microservices_1.RpcException({ statusCode, message });
}
//# sourceMappingURL=handleCatch.js.map