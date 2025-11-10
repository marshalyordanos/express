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
exports.AuthMfaDto = exports.AuthVerifyEmailDto = exports.AuthForgotPasswordDto = exports.AuthResetPasswordDto = exports.AuthChangePasswordDto = exports.AuthLoginMobileDto = exports.AuthLoginDto = exports.AuthRegisterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const lodash_1 = require("lodash");
class AuthRegisterDto {
    constructor() {
        this.customerType = 'INDIVIDUAL';
    }
}
exports.AuthRegisterDto = AuthRegisterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email must be valid' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim().toLowerCase()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Role Id is required' }),
    (0, class_validator_1.IsString)({ message: 'Role Id must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Branch ID must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone is required' }),
    (0, class_validator_1.IsString)({ message: 'Phone must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tax ID must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "taxId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contact person must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contact phone must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contact email must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toLowerCase()),
    (0, class_validator_1.IsEmail)({}, { message: 'Contact email must be valid' }),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Industry type must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "industryType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Website must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notes must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value?.trim())),
    __metadata("design:type", String)
], AuthRegisterDto.prototype, "notes", void 0);
class AuthLoginDto {
}
exports.AuthLoginDto = AuthLoginDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email must be valid' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim().toLowerCase()),
    __metadata("design:type", String)
], AuthLoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthLoginDto.prototype, "password", void 0);
class AuthLoginMobileDto {
}
exports.AuthLoginMobileDto = AuthLoginMobileDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone is required' }),
    (0, class_validator_1.IsString)({ message: 'Phone must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthLoginMobileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthLoginMobileDto.prototype, "password", void 0);
class AuthChangePasswordDto {
}
exports.AuthChangePasswordDto = AuthChangePasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Old password is required' }),
    (0, class_validator_1.IsString)({ message: 'Old password must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthChangePasswordDto.prototype, "oldPassword", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'New password is required' }),
    (0, class_validator_1.IsString)({ message: 'New password must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthChangePasswordDto.prototype, "newPassword", void 0);
class AuthResetPasswordDto {
}
exports.AuthResetPasswordDto = AuthResetPasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'New password is required' }),
    (0, class_validator_1.IsString)({ message: 'New password must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthResetPasswordDto.prototype, "newPassword", void 0);
class AuthForgotPasswordDto {
}
exports.AuthForgotPasswordDto = AuthForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email must be valid' }),
    (0, class_transformer_1.Transform)(({ value }) => value.trim().toLowerCase()),
    __metadata("design:type", String)
], AuthForgotPasswordDto.prototype, "email", void 0);
class AuthVerifyEmailDto {
}
exports.AuthVerifyEmailDto = AuthVerifyEmailDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthVerifyEmailDto.prototype, "token", void 0);
class AuthMfaDto {
}
exports.AuthMfaDto = AuthMfaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'MFA code is required' }),
    (0, class_validator_1.IsString)({ message: 'MFA code must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => (0, lodash_1.escape)(value.trim())),
    __metadata("design:type", String)
], AuthMfaDto.prototype, "code", void 0);
//# sourceMappingURL=auth.entity.js.map