"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaErrorMessage = getPrismaErrorMessage;
const client_1 = require("@prisma/client");
function getPrismaErrorMessage(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        console.log('code:::: ', error.code);
        switch (error.code) {
            case 'P2002':
                console.log('codenew: ', error.message);
                const fields = (error.meta?.target).join(', ');
                return `Duplicate value detected for fields: ${fields}`;
            case 'P2003':
                return `Foreign key constraint failed on field: ${error.meta?.field || 'unknown'}`;
            default:
                return error.message.split('\n')[1]?.trim() || 'Database error';
        }
    }
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return `Validation error: ${error.message}`;
    }
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        return `Unknown database error: ${error.message}`;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Internal server error';
}
//# sourceMappingURL=prismaError.js.map