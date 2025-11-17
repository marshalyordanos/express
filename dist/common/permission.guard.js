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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const check_permission_decorator_1 = require("./decorator/check-permission.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const microservices_1 = require("@nestjs/microservices");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const required = this.reflector.get(check_permission_decorator_1.PERMISSION_KEY, context.getHandler());
        if (!required)
            return true;
        const { resource, action, scopes } = required;
        const req = context.switchToHttp().getRequest();
        const userData = req.user;
        const user = await this.prisma.user.findUnique({
            where: { id: userData.sub },
        });
        if (!user)
            throw new microservices_1.RpcException('User not authenticated');
        if (user.isSuperAdmin)
            return true;
        if (!user.roleId)
            throw new microservices_1.RpcException('User has no role assigned');
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { roleId: user.roleId },
            include: { permission: true },
        });
        const hasPermission = rolePermissions.some((rp) => rp.permission.resource === resource && rp[action]);
        if (!hasPermission) {
            throw new microservices_1.RpcException(`You do not have permission to perform action [${action}] on ${resource}`);
        }
        if (scopes) {
            const scopeList = Array.isArray(scopes) ? scopes : [scopes];
            const userScopes = rolePermissions
                .filter((rp) => rp.permission.resource === resource && rp[action])
                .flatMap((rp) => rp.scope || []);
            const hasAnyScope = scopeList.some((s) => userScopes.includes(s));
            if (!hasAnyScope) {
                throw new microservices_1.RpcException(`You do not have required scope(s): ${scopeList.join(', ')}`);
            }
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map