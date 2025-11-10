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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderGatewayController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../contracts");
const order_entity_1 = require("../fulfillment/order/order.entity");
const query_dto_1 = require("../common/query/query.dto");
const jwt = require("jsonwebtoken");
let OrderGatewayController = class OrderGatewayController {
    constructor(orderClient) {
        this.orderClient = orderClient;
    }
    async createOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_CREATE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async orderCreateValidate(data, req) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_CREATE_NOT_LOGGED_IN_CUSTOMER, {
            data,
            ip,
        });
    }
    async acceptDropOffOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_ACCEPT_DROP_OFF, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async confirmPickup(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_CONFIRM_PICKUP, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async validateOrder(data, id, req) {
        console.log('data: ', data);
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_VALIDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async unusualOrder(data, orderId, req) {
        console.log('data: ', data);
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_MARK_UNUSUAL, {
            orderId,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async approveOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_APPROVE, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async cancelOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_CANCEL, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async exceptionOrder(data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_ADD_EXCEPTION, {
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getException(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_EXCEPTIONS, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async updateException(data, orderId, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_REMOVE_EXCEPTION, {
            orderId,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getAllOrders(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_ALL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getPendingApprovalOrders(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_PENDING_APPROVAL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getOrderStatusLog(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_STATUS_LOG, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getCategoricalOrders(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('authHeader: ', authHeader);
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_CATEGORICAL, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async trackOrder(code, req) {
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_BY_TRACK_CODE, {
            code,
            ip,
        });
    }
    async trackUserOrder(code, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_BY_USER_AND_TRACK_CODE, {
            code,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async updateOrder(id, data, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_UPDATE, {
            id,
            data,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
    async getMyOrders(req, query) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_MY_ORDERS, {
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
            query,
        });
    }
    async getOrder(id, req) {
        const authHeader = req.headers['authorization'] || null;
        let token = req.headers['authorization']?.replace('Bearer ', '') || null;
        const forwarded = req.headers['x-forwarded-for'] || '';
        const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
        let decodedUser = null;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
        }
        catch (err) {
            throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.orderClient.send(contracts_1.PATTERNS.ORDER_FIND_BY_ID, {
            id,
            headers: { authorization: authHeader },
            user: decodedUser,
            ip,
        });
    }
};
exports.OrderGatewayController = OrderGatewayController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('/user/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "orderCreateValidate", null);
__decorate([
    (0, common_1.Post)('/accept'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.AcceptDropOffDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "acceptDropOffOrder", null);
__decorate([
    (0, common_1.Post)('/confirm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.ConfirmPickUpOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "confirmPickup", null);
__decorate([
    (0, common_1.Patch)('/validate/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.ValidateOrderDto, String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "validateOrder", null);
__decorate([
    (0, common_1.Patch)('/unusual/:orderId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.MarkUnusualOrderDto, String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "unusualOrder", null);
__decorate([
    (0, common_1.Post)('/approve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.ApproveOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "approveOrder", null);
__decorate([
    (0, common_1.Patch)('/cancel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.CancelOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)('/exception'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.AddException, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "exceptionOrder", null);
__decorate([
    (0, common_1.Get)('/exception'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getException", null);
__decorate([
    (0, common_1.Patch)('/exception/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.UpdateOrderDto, String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "updateException", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('/approval/pending'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getPendingApprovalOrders", null);
__decorate([
    (0, common_1.Get)('/status/log'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getOrderStatusLog", null);
__decorate([
    (0, common_1.Get)('/categorical'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getCategoricalOrders", null);
__decorate([
    (0, common_1.Get)('/track/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "trackOrder", null);
__decorate([
    (0, common_1.Get)('/user/track/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "trackUserOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_entity_1.UpdateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Get)('/my-orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_dto_1.ListQueryDto]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderGatewayController.prototype, "getOrder", null);
exports.OrderGatewayController = OrderGatewayController = __decorate([
    (0, common_1.Controller)('order'),
    __param(0, (0, common_1.Inject)('FULFILLMENT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], OrderGatewayController);
//# sourceMappingURL=order.gateway.controller.js.map