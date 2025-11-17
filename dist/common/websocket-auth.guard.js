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
exports.WsJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt = require("jsonwebtoken");
const public_decorator_1 = require("./decorator/public.decorator");
let WsJwtAuthGuard = class WsJwtAuthGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.WS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const client = context.switchToWs().getClient();
        if (isPublic)
            return true;
        try {
            const token = client.handshake.auth?.token?.replace('Bearer ', '') ||
                client.handshake.headers['authorization']?.replace('Bearer ', '');
            if (!token) {
                this.handleUnauthorized(client, 'Missing auth token');
                return false;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
            client.user = decoded;
            return true;
        }
        catch (err) {
            this.handleUnauthorized(client, 'Invalid or expired token');
            return false;
        }
    }
    async handleUnauthorized(client, message) {
        try {
            client.emit('unauthorized', { status: 'error', message });
            client.emit('unauthorized', { status: 'error', message }, () => {
                client.disconnect(true);
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        catch (e) {
            console.error('Error emitting unauthorized event:', e);
            client.disconnect(true);
        }
    }
};
exports.WsJwtAuthGuard = WsJwtAuthGuard;
exports.WsJwtAuthGuard = WsJwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], WsJwtAuthGuard);
//# sourceMappingURL=websocket-auth.guard.js.map