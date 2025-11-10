"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidator = void 0;
class PasswordValidator {
    static validate(newPassword, currentPassword) {
        if (!newPassword || newPassword.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }
        const uppercase = /[A-Z]/.test(newPassword);
        const lowercase = /[a-z]/.test(newPassword);
        const number = /[0-9]/.test(newPassword);
        const special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        if (!uppercase || !lowercase || !number || !special) {
            return { isValid: false, message: 'Password must include uppercase, lowercase, number, and special character' };
        }
        if (currentPassword && currentPassword === newPassword) {
            return { isValid: false, message: 'New password cannot be same as current password' };
        }
        return { isValid: true, message: 'Password is valid' };
    }
}
exports.PasswordValidator = PasswordValidator;
//# sourceMappingURL=password-validator.js.map