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
exports.Role = exports.RoleUpdateDto = exports.RoleResponseDto = exports.RoleCreateDto = void 0;
const class_validator_1 = require("class-validator");
class RoleCreateDto {
}
exports.RoleCreateDto = RoleCreateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleCreateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleCreateDto.prototype, "description", void 0);
class RoleResponseDto {
}
exports.RoleResponseDto = RoleResponseDto;
class RoleUpdateDto {
}
exports.RoleUpdateDto = RoleUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleUpdateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoleUpdateDto.prototype, "description", void 0);
var Role;
(function (Role) {
    Role["BRANCH_MANAGER"] = "BRANCH_MANAGER";
    Role["DISPATCH_OFFICER"] = "DISPATCH_OFFICER";
    Role["DRIVER"] = "DRIVER";
    Role["CUSTOMER"] = "CUSTOMER";
    Role["CUSTOMER_SERVICE"] = "CUSTOMER_SERVICE";
})(Role || (exports.Role = Role = {}));
//# sourceMappingURL=role.entity.js.map