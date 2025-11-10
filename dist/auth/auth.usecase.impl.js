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
exports.AuthUseCaseImpl = void 0;
const common_1 = require("@nestjs/common");
const auth_repository_1 = require("./auth.repository");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const microservices_1 = require("@nestjs/microservices");
const password_validator_1 = require("../common/password-validator");
const handleCatch_1 = require("../common/handleCatch");
const app_logger_service_1 = require("../common/app-logger.service");
const notification_publisher_1 = require("../common/notification-publisher");
let AuthUseCaseImpl = class AuthUseCaseImpl {
    constructor(authRepository, jwtService, logger, notificationPublisher) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.logger = logger;
        this.notificationPublisher = notificationPublisher;
        this.logger.setContext('AuthService', 'AuthModule');
    }
    async register(data) {
        this.logger.log(`Registering new user with roleId: ${data.role} and phone/email: ${data.phone || data.email}`);
        try {
            const roleId = data.role;
            const role = await this.authRepository.findRoleById(roleId);
            if (!role) {
                this.logger.warn(`Invalid role ID: ${roleId}`);
                throw new microservices_1.RpcException({ statusCode: 400, message: 'Invalid role' });
            }
            this.logger.verbose(`Role validated: ${role.name}`);
            if (role.name === 'CUSTOMER' || role.name === 'DRIVER') {
                const existingUser = await this.authRepository.findByPhone(data.phone);
                if (existingUser) {
                    this.logger.warn(`Phone already in use: ${data.phone}`);
                    throw new microservices_1.RpcException({
                        statusCode: 409,
                        message: 'Phone already in use',
                    });
                }
            }
            else {
                const existingUser = await this.authRepository.findByEmail(data.email);
                if (existingUser) {
                    this.logger.warn(`Email already in use: ${data.email}`);
                    throw new microservices_1.RpcException({
                        statusCode: 409,
                        message: 'Email already in use',
                    });
                }
            }
            const valid = password_validator_1.PasswordValidator.validate(data.password);
            if (!valid.isValid) {
                this.logger.warn(`⚠️ Weak password attempt by user email/phone: ${data.email}, ${data.phone}`);
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: valid.message,
                });
            }
            this.logger.verbose('Hashing password...');
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = await this.authRepository.createUser(data, hashedPassword);
            this.logger.log(`User created successfully with ID: ${user.id}`);
            try {
                if (role.name === 'CUSTOMER' || role.name === 'DRIVER') {
                    await this.authRepository.sendVerificationPhone(user.id, user.email);
                    this.logger.verbose(`Verification phone sent to user ${user.id}`);
                }
                else {
                    await this.notificationPublisher.publish('user.registration', {
                        type: 'user.registration',
                        userId: user.id,
                        userEmail: user.email,
                    });
                    this.logger.verbose(`Verification email sent to user ${user.id}`);
                }
            }
            catch (notifyErr) {
                this.logger.warn(`Verification sending failed for user ${user.id}: ${notifyErr.message}`);
            }
            delete user.password;
            this.logger.log(`Registration completed for user ${user.id}`);
            await this.authRepository.createNotificationPreferences(user.id);
            this.logger.log(`Notification preferences created for user ${user.id}`);
            return user;
        }
        catch (error) {
            this.logger.error(`User registration failed: ${error.message}`);
            throw (0, handleCatch_1.handleCatch)(error);
        }
    }
    async login(data) {
        this.logger.log(`Login attempt for email: ${data.email}`);
        try {
            const user = await this.authRepository.findByEmail(data.email);
            if (!user) {
                this.logger.warn(`Login failed — user not found: ${data.email}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid credentials',
                });
            }
            this.logger.verbose(`User found: ${user.id} (${user.email})`);
            const isPasswordValid = await bcrypt.compare(data.password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password for user: ${user.email}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid credentials',
                });
            }
            this.logger.verbose(`Generating access and refresh tokens for user: ${user.id}`);
            const tokens = await this.generateTokens(user);
            await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
            this.logger.log(`Refresh token saved for user: ${user.id}`);
            delete user.password;
            this.logger.log(`Login successful for user: ${user.id}`);
            return { user, tokens };
        }
        catch (error) {
            this.logger.error(`Login failed for ${data.email}: ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException('Login process failed. Please try again.');
        }
    }
    async loginMobile(data) {
        this.logger.log(`Mobile login attempt for phone: ${data.phone}`);
        try {
            const user = await this.authRepository.findByPhone(data.phone);
            if (!user) {
                this.logger.warn(`Login failed — user not found for phone: ${data.phone}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid credentials',
                });
            }
            this.logger.verbose(`User found: ${user.id} (${user.phone})`);
            const isPasswordValid = await bcrypt.compare(data.password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password for user (phone): ${data.phone}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid credentials',
                });
            }
            this.logger.verbose(`Generating tokens for user: ${user.id}`);
            const tokens = await this.generateTokens(user);
            await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
            this.logger.log(`Refresh token saved for user: ${user.id}`);
            delete user.password;
            this.logger.log(`Mobile login successful for user: ${user.id}`);
            return { user, tokens };
        }
        catch (error) {
            this.logger.error(`Mobile login failed for ${data.phone}: ${error.message}`);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException('Mobile login process failed. Please try again.');
        }
    }
    async logout(userId, sessionId) {
        this.logger.log(`Logout initiated for user: ${userId}, session: ${sessionId ?? 'N/A'}`);
        try {
            await this.authRepository.removeRefreshToken(userId, sessionId);
            this.logger.log(`Successfully logged out user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Logout failed for user: ${userId}`, error.stack);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Logout failed. Please try again.',
            });
        }
    }
    async refreshToken(userId, refreshToken) {
        this.logger.log(`Refreshing token for user: ${userId}`);
        try {
            if (!refreshToken) {
                throw new microservices_1.RpcException({
                    statusCode: 400,
                    message: 'Refresh token is required',
                });
            }
            const session = await this.authRepository.findSessionByRefreshToken(userId, refreshToken);
            if (!session) {
                this.logger.warn(`Invalid refresh token for user: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid or expired refresh token',
                });
            }
            const user = await this.authRepository.findById(session.userId);
            if (!user) {
                this.logger.warn(`User not found for session: ${session.id}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'User not found or session invalid',
                });
            }
            const tokens = await this.generateTokens(user);
            await this.authRepository.updateRefreshToken(user.id, tokens.refreshToken, session.id);
            this.logger.log(`Tokens refreshed for user: ${user.id}`);
            return tokens;
        }
        catch (error) {
            this.logger.error(`Token refresh failed for user: ${userId} → ${error.message}`, error.stack);
            throw error instanceof microservices_1.RpcException
                ? error
                : new microservices_1.RpcException({
                    statusCode: 500,
                    message: 'Token refresh failed. Please try again later.',
                });
        }
    }
    async changePassword(userId, data) {
        this.logger.log(`🔐 Password change requested for user: ${userId}`);
        try {
            const user = await this.authRepository.findById(userId);
            if (!user) {
                this.logger.warn(`❌ User not found: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 404,
                    message: 'User not found',
                });
            }
            const isOldPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
            if (!isOldPasswordValid) {
                this.logger.warn(`⚠️ Invalid old password attempt for user: ${userId}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Old password is incorrect',
                });
            }
            const valid = password_validator_1.PasswordValidator.validate(data.newPassword, data.oldPassword);
            if (!valid.isValid) {
                this.logger.warn(`⚠️ Weak password attempt by user: ${userId}`);
                throw new common_1.BadRequestException(valid.message);
            }
            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            await this.authRepository.updatePassword(userId, hashedPassword);
            await this.authRepository.invalidateRefreshToken(userId);
            this.logger.log(`✅ Password successfully changed for user: ${userId}`);
            return;
        }
        catch (error) {
            this.logger.error(`❗Failed to change password for user: ${userId} | Reason: ${error.message}`);
            if (error instanceof microservices_1.RpcException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Internal server error while changing password',
            });
        }
    }
    async forgotPassword(data) {
        this.logger.log(`🔐 Forgot password requested for email: ${data.email}`);
        try {
            const user = await this.authRepository.findByEmail(data.email);
            if (!user) {
                this.logger.warn(`⚠️ Forgot password requested for non-existing email: ${data.email}`);
                return {
                    success: true,
                    message: 'If an account exists with that email, a reset link has been sent.',
                };
            }
            const resetToken = await this.authRepository.generateResetToken(user.id);
            await this.authRepository.sendResetPasswordEmail(user.email, resetToken);
            this.logger.log(`📧 Password reset email sent to: ${user.email}`);
            return {
                success: true,
                message: 'If an account exists with that email, a reset link has been sent.',
            };
        }
        catch (error) {
            this.logger.error(`❗Failed forgot password request for ${data.email} | Reason: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Internal server error while processing forgot password request.',
            });
        }
    }
    async getAuthenticatedUser(sub) {
        try {
            const user = await this.authRepository.findById(sub);
            if (!user) {
                this.logger.warn(`Attempt to access non-existent user: ${sub}`);
                throw new microservices_1.RpcException({ statusCode: 404, message: 'User not found' });
            }
            delete user.password;
            this.logger.log(`Fetching authenticated user: ${sub}`);
            return user;
        }
        catch (error) {
            this.logger.error(`Error fetching authenticated user ${sub}: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Failed to retrieve authenticated user',
            });
        }
    }
    async resetPassword(data) {
        this.logger.log(`🔐 Password reset attempt with token: ${data.token}`);
        try {
            const userId = await this.authRepository.verifyResetToken(data.token);
            if (!userId) {
                this.logger.warn(`⚠️ Invalid or expired reset token used: ${data.token}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid or expired token',
                });
            }
            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            await this.authRepository.updatePassword(userId, hashedPassword);
            await this.authRepository.invalidateResetToken(data.token);
            this.logger.log(`✅ Password successfully reset for userId: ${userId}`);
            return {
                success: true,
                message: 'Password has been reset successfully. Please log in with your new password.',
            };
        }
        catch (error) {
            this.logger.error(`❗Failed password reset using token: ${data.token} | Reason: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Internal server error while resetting password',
            });
        }
    }
    async verifyEmail(data) {
        this.logger.log(`🔐 Email verification attempt with token: ${data.token}`);
        try {
            const userId = await this.authRepository.verifyEmailToken(data.token);
            if (!userId) {
                this.logger.warn(`⚠️ Invalid email verification token used: ${data.token}`);
                throw new microservices_1.RpcException({
                    statusCode: 401,
                    message: 'Invalid verification token',
                });
            }
            await this.authRepository.markEmailAsVerified(userId);
            this.logger.log(`✅ Email successfully verified for userId: ${userId}`);
            return { success: true, message: 'Email verified successfully.' };
        }
        catch (error) {
            this.logger.error(`❗Failed email verification with token: ${data.token} | Reason: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Internal server error while verifying email',
            });
        }
    }
    async resendVerification(email) {
        this.logger.log(`📧 Resend verification requested for email: ${email}`);
        try {
            const user = await this.authRepository.findByEmail(email);
            if (!user || user.emailVerified) {
                this.logger.log(`⚠️ No action needed for email: ${email}`);
                return {
                    success: true,
                    message: 'If your email is not verified, a verification email has been sent.',
                };
            }
            await this.authRepository.sendVerificationEmail(user.id, email);
            this.logger.log(`📧 Verification email resent to: ${email}`);
            return {
                success: true,
                message: 'If your email is not verified, a verification email has been sent.',
            };
        }
        catch (error) {
            this.logger.error(`❗Failed to resend verification for email: ${email} | Reason: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Internal server error while resending verification email',
            });
        }
    }
    async generateTokens(user) {
        try {
            this.logger.log(`🔑 Generating JWT tokens for userId: ${user.id}`);
            const payload = { sub: user.id, email: user.email };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
            this.logger.log(`✅ Tokens generated for userId: ${user.id}`);
            return { accessToken, refreshToken };
        }
        catch (error) {
            this.logger.error(`❗Failed to generate tokens for userId: ${user.id} | Reason: ${error.message}`);
            throw new microservices_1.RpcException({
                statusCode: 500,
                message: 'Failed to generate authentication tokens',
            });
        }
    }
    async createSuperAdmin() {
        const user = await this.authRepository.createSuperAdmin();
    }
};
exports.AuthUseCaseImpl = AuthUseCaseImpl;
exports.AuthUseCaseImpl = AuthUseCaseImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        app_logger_service_1.AppLogger,
        notification_publisher_1.NotificationPublisher])
], AuthUseCaseImpl);
//# sourceMappingURL=auth.usecase.impl.js.map