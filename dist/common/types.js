"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IResponse = void 0;
class IResponse {
    constructor(success = true, message, data, pagination) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
    }
    static success(message, data, pagination) {
        return new IResponse(true, message, data, pagination);
    }
}
exports.IResponse = IResponse;
//# sourceMappingURL=types.js.map