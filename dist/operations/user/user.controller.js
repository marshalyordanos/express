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
exports.UserMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const contracts_1 = require("../../contracts");
const user_usecase_impl_1 = require("./user.usecase.impl");
const types_1 = require("../../common/types");
const check_permission_decorator_1 = require("../../common/decorator/check-permission.decorator");
const permission_guard_1 = require("../../common/permission.guard");
const permission_actions_enum_1 = require("../../contracts/permission-actions.enum");
const rate_limit_guard_1 = require("../../common/rate-limit.guard");
let UserMessageController = class UserMessageController {
    constructor(usecases) {
        this.usecases = usecases;
    }
    async findById(payload) {
        const user = await this.usecases.getUser(payload.id);
        return types_1.IResponse.success('Fetch user successfully', user);
    }
    async findAll(payload) {
        const result = await this.usecases.getAllUsers(payload.query);
        return types_1.IResponse.success('Users fetched successfully', result.models, result.pagination);
    }
    async update(payload) {
        const userId = payload.user.sub;
        const user = await this.usecases.updateUser(userId, payload.data);
        return types_1.IResponse.success(' user updated successfully', user);
    }
    async deleteUser(payload) {
        const user = await this.usecases.deleteUser(payload.id);
        return types_1.IResponse.success(' user deleted successfully', user);
    }
    async findByEmail(payload) {
        const result = await this.usecases.findUserByEmail(payload.email);
        return types_1.IResponse.success('User fetched successfully', result);
    }
    async addAddress(payload) {
        const address = await this.usecases.addAddress(payload.data);
        return types_1.IResponse.success('Address added successfully', address);
    }
    async listAddresses(data) {
        const user = data.user;
        const addresses = await this.usecases.listAddresses(user.sub);
        return types_1.IResponse.success('Address fetched successfully', addresses);
    }
    async updateAddress(payload) {
        const userId = payload.user.sub;
        const address = await this.usecases.updateAddress(payload.id, payload.data, userId);
        return types_1.IResponse.success('Address updated successfully', address);
    }
    async deleteAddress(payload) {
        const address = await this.usecases.deleteAddress(payload.id);
        return types_1.IResponse.success('Address deleted successfully', address);
    }
    async updatePreferences(payload) {
        const user = payload.user.sub;
        const preff = await this.usecases.updatePreferences(payload.userId, payload.data, user);
        return types_1.IResponse.success('Preferences updated  successfully', preff);
    }
    async updateCorporateInfo(payload) {
        const corporateInfo = await this.usecases.updateCorporateInfo(payload.userId, payload.data);
        return types_1.IResponse.success('Corporate info updated  successfully', corporateInfo);
    }
    async findAllCustomers(payload) {
        const result = await this.usecases.getAllCustomer(payload.query);
        return types_1.IResponse.success('Customers fetched successfully', result.models, result.pagination);
    }
    async getCustomerOrder(payload) {
        const user = payload.user;
        const result = await this.usecases.getCustomerOrder(payload.query, user.sub);
        return types_1.IResponse.success('Customer orders fetched successfully', result.models, result.pagination);
    }
    async createCategory(payload) {
        const category = await this.usecases.createCategory(payload.data);
        return types_1.IResponse.success('Category created successfully', category);
    }
    async listCategories(payload) {
        const categories = await this.usecases.listCategories(payload.query);
        return types_1.IResponse.success('Categories fetched successfully', categories);
    }
    async findCategory(payload) {
        const category = await this.usecases.findCategory(payload.id);
        return types_1.IResponse.success('Category fetched successfully', category);
    }
    async updateCategory(payload) {
        const category = await this.usecases.updateCategory(payload.id, payload.data);
        return types_1.IResponse.success('Category updated successfully', category);
    }
    async deleteCategory(payload) {
        const category = await this.usecases.deleteCategory(payload.id);
        return types_1.IResponse.success('Category deleted successfully', category);
    }
    async findCategoryByName(payload) {
        const category = await this.usecases.findCategoryByName(payload.name);
        return types_1.IResponse.success('Category fetched successfully', category);
    }
    async assignCategoryToUser(payload) {
        const { customerIds, customerCategoryId } = payload.data;
        const category = await this.usecases.assignCustomersToCategory(customerIds, customerCategoryId);
        return types_1.IResponse.success('Category assigned successfully', category);
    }
    async unassignCategoryToUser(payload) {
        const category = await this.usecases.removeCustomersFromCategory(payload.customerIds);
        return types_1.IResponse.success('Category unassigned successfully', category);
    }
    async createUserNotificationPreference(payload) {
        const userId = payload.user.sub;
        const preference = await this.usecases.createUserNotificationPreference(userId);
        return types_1.IResponse.success('User Notification Preference created successfully', preference);
    }
    async updateUserNotificationPreference(payload) {
        const userId = payload.user.sub;
        const preference = await this.usecases.updateUserNotificationPreference(payload.data, userId);
        return types_1.IResponse.success('User Notification Preference Updated successfully', preference);
    }
    async getUserNotificationPreference(payload) {
        const userId = payload.user.sub;
        const preference = await this.usecases.getUserNotificationPreference(userId);
        return types_1.IResponse.success('User Notification Preference Fetched successfully', preference);
    }
    async createDriver(payload) {
        const result = await this.usecases.createDriver(payload.data);
        return types_1.IResponse.success('Driver with id [' +
            payload.data.userId +
            '] is successfully created for vehicle with id [' +
            payload.data.vehicleId +
            '].', result);
    }
    async findDriver(payload) {
        const result = await this.usecases.findDriver(payload.query);
        return types_1.IResponse.success('Officer created successfully', result);
    }
};
exports.UserMessageController = UserMessageController;
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_FIND_BY_EMAIL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ADDRESS_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "addAddress", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ADDRESS_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "listAddresses", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ADDRESS_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.ADDRESS_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.PREFERENCES_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CORPORATEINFO_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "updateCorporateInfo", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ, permission_actions_enum_1.ScopeAction.FULL),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_ALL_CUSTOMERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findAllCustomers", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_ORDERS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "getCustomerOrder", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "createCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "listCategories", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_FIND_BY_ID),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.DELETE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findCategoryByName", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_ASSIGN_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "assignCategoryToUser", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('CustomerCategory', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.CUSTOMER_CATEGORY_UNASSIGN_USER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "unassignCategoryToUser", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Preference', permission_actions_enum_1.PermissionActions.CREATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_CREATE_NOTIFICATION_PREFERENCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "createUserNotificationPreference", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Preference', permission_actions_enum_1.PermissionActions.UPDATE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_UPDATE_NOTIFICATION_PREFERENCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "updateUserNotificationPreference", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('Preference', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_FIND_NOTIFICATION_PREFERENCE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "getUserNotificationPreference", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.CREATE, permission_actions_enum_1.ScopeAction.APPROVE),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_CREATE_DRIVER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "createDriver", null);
__decorate([
    (0, common_1.UseGuards)(permission_guard_1.PermissionGuard, rate_limit_guard_1.RateLimitGuard),
    (0, check_permission_decorator_1.CheckPermission)('User', permission_actions_enum_1.PermissionActions.READ),
    (0, microservices_1.MessagePattern)(contracts_1.PATTERNS.USER_FIND_DRIVER),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserMessageController.prototype, "findDriver", null);
exports.UserMessageController = UserMessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [user_usecase_impl_1.UserUseCasesImp])
], UserMessageController);
//# sourceMappingURL=user.controller.js.map