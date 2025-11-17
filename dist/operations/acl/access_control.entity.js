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
exports.AssignUserRoleDto = exports.RemovePermissionDto = exports.ChangeRolePermissionDto = exports.PermissionActionDto = exports.RoleDto = exports.PermissionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const lodash_1 = require("lodash");
class PermissionDto {
}
exports.PermissionDto = PermissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Resource is required!!' }),
    __metadata("design:type", String)
], PermissionDto.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionDto.prototype, "description", void 0);
class RoleDto {
}
exports.RoleDto = RoleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Role name is required' }),
    __metadata("design:type", String)
], RoleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RoleDto.prototype, "permissions", void 0);
class PermissionActionDto {
}
exports.PermissionActionDto = PermissionActionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PermissionActionDto.prototype, "permissionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionActionDto.prototype, "createAction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionActionDto.prototype, "readAction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionActionDto.prototype, "updateAction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PermissionActionDto.prototype, "deleteAction", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PermissionActionDto.prototype, "scopes", void 0);
class ChangeRolePermissionDto {
}
exports.ChangeRolePermissionDto = ChangeRolePermissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Role ID is required' }),
    __metadata("design:type", String)
], ChangeRolePermissionDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PermissionActionDto),
    __metadata("design:type", Array)
], ChangeRolePermissionDto.prototype, "permissions", void 0);
class RemovePermissionDto {
}
exports.RemovePermissionDto = RemovePermissionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'permissionId is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], RemovePermissionDto.prototype, "permissionId", void 0);
class AssignUserRoleDto {
}
exports.AssignUserRoleDto = AssignUserRoleDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignUserRoleDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignUserRoleDto.prototype, "roleId", void 0);
//# sourceMappingURL=access_control.entity.js.map