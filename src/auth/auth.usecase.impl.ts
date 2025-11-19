// auth.usecase.impl.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthUseCase } from './auth.usecase';
import { AuthRepository } from './auth.repository';
import { User } from '@prisma/client';
import {
  AuthRegisterDto,
  AuthLoginDto,
  AuthTokens,
  AuthChangePasswordDto,
  AuthForgotPasswordDto,
  AuthResetPasswordDto,
  AuthVerifyEmailDto,
  AuthLoginMobileDto,
} from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { PasswordValidator } from '../common/password-validator';
import { handleCatch } from '../common/handleCatch';
import { AppLogger } from '../common/app-logger.service';
import { NotificationPublisher } from '../common/notification-publisher';

@Injectable()
export class AuthUseCaseImpl implements AuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
    private readonly notificationPublisher: NotificationPublisher,
  ) {
    // this.logger.setContext('AuthService', 'AuthModule');
  }

  // ----------------- Core Authentication -----------------
  async register(data: AuthRegisterDto): Promise<User> {
    this.logger.log(
      `Registering new user with roleId: ${data.role} and phone/email: ${data.phone || data.email}`,
    );

    try {
      // 1️⃣ Validate Role
      const roleId = data.role;
      const role = await this.authRepository.findRoleById(roleId);
      if (!role) {
        this.logger.warn(`Invalid role ID: ${roleId}`);
        throw new RpcException({ statusCode: 400, message: 'Invalid role' });
      }
      this.logger.verbose(`Role validated: ${role.name}`);

      // 2️⃣ Check for existing user based on role
      if (role.name === 'CUSTOMER' || role.name === 'DRIVER') {
        const existingUser = await this.authRepository.findByPhone(data.phone);
        if (existingUser) {
          this.logger.warn(`Phone already in use: ${data.phone}`);
          throw new RpcException({
            statusCode: 409,
            message: 'Phone already in use',
          });
        }
      } else {
        const existingUser = await this.authRepository.findByEmail(data.email);
        if (existingUser) {
          this.logger.warn(`Email already in use: ${data.email}`);
          throw new RpcException({
            statusCode: 409,
            message: 'Email already in use',
          });
        }
      }
      // ✅ Validate new password strength
      const valid = PasswordValidator.validate(data.password);
      if (!valid.isValid) {
        this.logger.warn(
          `⚠️ Weak password attempt by user email/phone: ${data.email}, ${data.phone}`,
        );
        throw new RpcException({
          statusCode: 400,
          message: valid.message,
        });
      }

      // 3️⃣ Hash password securely
      this.logger.verbose('Hashing password...');
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // 4️⃣ Create user
      const user = await this.authRepository.createUser(data, hashedPassword);
      this.logger.log(`User created successfully with ID: ${user.id}`);

      // 5️⃣ Send verification (based on role)
      try {
        if (role.name === 'CUSTOMER' || role.name === 'DRIVER') {
          await this.authRepository.sendVerificationPhone(user.id, user.email);
          this.logger.verbose(`Verification phone sent to user ${user.id}`);
        } else {
          await this.notificationPublisher.publish('user.registration', {
            type: 'user.registration',
            userId: user.id,
            userEmail: user.email,
            // message: `Please verify your email by clicking the link.`,
            // payload: { orderId: order.id, tracking: trackingCode }, // extra metadata
          });

          this.logger.verbose(`Verification email sent to user ${user.id}`);
        }
      } catch (notifyErr) {
        this.logger.warn(
          `Verification sending failed for user ${user.id}: ${notifyErr.message}`,
        );
      }

      // 6️⃣ Clean sensitive data
      delete user.password;
      this.logger.log(`Registration completed for user ${user.id}`);

      await this.authRepository.createNotificationPreferences(user.id);

      this.logger.log(`Notification preferences created for user ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `User registration failed: ${error.message}`,
        // error.stack,
      );
      throw handleCatch(error);
    }
  }
  async login(data: AuthLoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    this.logger.log(`Login attempt for email: ${data.email}`);

    try {
      // 1️⃣ Find user by email
      const user = await this.authRepository.findByEmail(data.email);
      if (!user) {
        this.logger.warn(`Login failed — user not found: ${data.email}`);
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }
      this.logger.verbose(`User found: ${user.id} (${user.email})`);

      // 2️⃣ Validate password
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${user.email}`);
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      // 3️⃣ Generate tokens
      this.logger.verbose(
        `Generating access and refresh tokens for user: ${user.id}`,
      );
      const tokens = await this.generateTokens(user);

      // 4️⃣ Save refresh token securely
      await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
      this.logger.log(`Refresh token saved for user: ${user.id}`);

      // 5️⃣ Sanitize user data
      delete user.password;

      // 6️⃣ Return successful login response
      this.logger.log(`Login successful for user: ${user.id}`);
      return { user, tokens };
    } catch (error) {
      this.logger.error(
        `Login failed for ${data.email}: ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException('Login process failed. Please try again.');
    }
  }

  async loginMobile(
    data: AuthLoginMobileDto,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    this.logger.log(`Mobile login attempt for phone: ${data.phone}`);

    try {
      // 1️⃣ Find user by phone
      const user = await this.authRepository.findByPhone(data.phone);
      if (!user) {
        this.logger.warn(
          `Login failed — user not found for phone: ${data.phone}`,
        );
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }
      this.logger.verbose(`User found: ${user.id} (${user.phone})`);

      // 2️⃣ Validate password
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user (phone): ${data.phone}`);
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      // 3️⃣ Generate tokens
      this.logger.verbose(`Generating tokens for user: ${user.id}`);
      const tokens = await this.generateTokens(user);

      // 4️⃣ Save refresh token
      await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
      this.logger.log(`Refresh token saved for user: ${user.id}`);

      // 5️⃣ Remove sensitive info
      delete user.password;

      // 6️⃣ Success response
      this.logger.log(`Mobile login successful for user: ${user.id}`);
      return { user, tokens };
    } catch (error) {
      this.logger.error(
        `Mobile login failed for ${data.phone}: ${error.message}`,
        // error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException('Mobile login process failed. Please try again.');
    }
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    this.logger.log(
      `Logout initiated for user: ${userId}, session: ${sessionId ?? 'N/A'}`,
    );

    try {
      await this.authRepository.removeRefreshToken(userId, sessionId);
      this.logger.log(`Successfully logged out user: ${userId}`);
    } catch (error) {
      this.logger.error(`Logout failed for user: ${userId}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Logout failed. Please try again.',
      });
    }
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    this.logger.log(`Refreshing token for user: ${userId}`);

    try {
      if (!refreshToken) {
        throw new RpcException({
          statusCode: 400,
          message: 'Refresh token is required',
        });
      }

      // 1️⃣ Validate session + refresh token
      const session = await this.authRepository.findSessionByRefreshToken(
        userId,
        refreshToken,
      );

      if (!session) {
        this.logger.warn(`Invalid refresh token for user: ${userId}`);
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid or expired refresh token',
        });
      }

      // 2️⃣ Validate user existence
      const user = await this.authRepository.findById(session.userId);
      if (!user) {
        this.logger.warn(`User not found for session: ${session.id}`);
        throw new RpcException({
          statusCode: 401,
          message: 'User not found or session invalid',
        });
      }

      // 3️⃣ Generate new tokens
      const tokens = await this.generateTokens(user);
      await this.authRepository.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        session.id,
      );

      this.logger.log(`Tokens refreshed for user: ${user.id}`);
      return tokens;
    } catch (error) {
      this.logger.error(
        `Token refresh failed for user: ${userId} → ${error.message}`,
        error.stack,
      );
      throw error instanceof RpcException
        ? error
        : new RpcException({
            statusCode: 500,
            message: 'Token refresh failed. Please try again later.',
          });
    }
  }

  // ----------------- Password Management -----------------
  async changePassword(
    userId: string,
    data: AuthChangePasswordDto,
  ): Promise<void> {
    this.logger.log(`🔐 Password change requested for user: ${userId}`);

    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        this.logger.warn(`❌ User not found: ${userId}`);
        throw new RpcException({
          statusCode: 404,
          message: 'User not found',
        });
      }

      // ✅ Verify old password
      const isOldPasswordValid = await bcrypt.compare(
        data.oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        this.logger.warn(`⚠️ Invalid old password attempt for user: ${userId}`);
        throw new RpcException({
          statusCode: 401,
          message: 'Old password is incorrect',
        });
      }

      // ✅ Validate new password strength
      const valid = PasswordValidator.validate(
        data.newPassword,
        data.oldPassword,
      );
      if (!valid.isValid) {
        this.logger.warn(`⚠️ Weak password attempt by user: ${userId}`);
        throw new BadRequestException(valid.message);
      }

      // ✅ Update password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await this.authRepository.updatePassword(userId, hashedPassword);

      // ✅ Invalidate existing refresh tokens (security best practice)
      await this.authRepository.invalidateRefreshToken(userId);

      this.logger.log(`✅ Password successfully changed for user: ${userId}`);

      return;
    } catch (error) {
      // 🛑 Log unexpected errors (but don’t expose details to clients)
      this.logger.error(
        `❗Failed to change password for user: ${userId} | Reason: ${error.message}`,
        // error.stack,
      );

      if (
        error instanceof RpcException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error while changing password',
      });
    }
  }
  async forgotPassword(
    data: AuthForgotPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🔐 Forgot password requested for email: ${data.email}`);

    try {
      const user = await this.authRepository.findByEmail(data.email);

      if (!user) {
        this.logger.warn(
          `⚠️ Forgot password requested for non-existing email: ${data.email}`,
        );

        // ✅ Silent fail to prevent email enumeration
        return {
          success: true,
          message:
            'If an account exists with that email, a reset link has been sent.',
        };
      }

      // ✅ Generate reset token
      const resetToken = await this.authRepository.generateResetToken(user.id);

      // ✅ Send reset email
      await this.authRepository.sendResetPasswordEmail(user.email, resetToken);

      this.logger.log(`📧 Password reset email sent to: ${user.email}`);

      return {
        success: true,
        message:
          'If an account exists with that email, a reset link has been sent.',
      };
    } catch (error) {
      // 🛑 Log internal error
      this.logger.error(
        `❗Failed forgot password request for ${data.email} | Reason: ${error.message}`,
        // error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message:
          'Internal server error while processing forgot password request.',
      });
    }
  }
  async getAuthenticatedUser(sub: string) {
    try {
      const user = await this.authRepository.findById(sub);
      if (!user) {
        this.logger.warn(`Attempt to access non-existent user: ${sub}`);
        throw new RpcException({ statusCode: 404, message: 'User not found' });
      }
      delete user.password;
      this.logger.log(`Fetching authenticated user: ${sub}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Error fetching authenticated user ${sub}: ${error.message}`,
        // error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to retrieve authenticated user',
      });
    }
  }

  async resetPassword(
    data: AuthResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🔐 Password reset attempt with token: ${data.token}`);

    try {
      const userId = await this.authRepository.verifyResetToken(data.token);
      if (!userId) {
        this.logger.warn(
          `⚠️ Invalid or expired reset token used: ${data.token}`,
        );
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid or expired token',
        });
      }

      // ✅ Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await this.authRepository.updatePassword(userId, hashedPassword);

      // ✅ Invalidate the token after use
      await this.authRepository.invalidateResetToken(data.token);

      this.logger.log(`✅ Password successfully reset for userId: ${userId}`);

      return {
        success: true,
        message:
          'Password has been reset successfully. Please log in with your new password.',
      };
    } catch (error) {
      // 🛑 Log unexpected errors
      this.logger.error(
        `❗Failed password reset using token: ${data.token} | Reason: ${error.message}`,
        // error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error while resetting password',
      });
    }
  }

  // ----------------- Email Verification -----------------
  async verifyEmail(
    data: AuthVerifyEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🔐 Email verification attempt with token: ${data.token}`);

    try {
      const userId = await this.authRepository.verifyEmailToken(data.token);
      if (!userId) {
        this.logger.warn(
          `⚠️ Invalid email verification token used: ${data.token}`,
        );
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid verification token',
        });
      }

      await this.authRepository.markEmailAsVerified(userId);
      this.logger.log(`✅ Email successfully verified for userId: ${userId}`);

      return { success: true, message: 'Email verified successfully.' };
    } catch (error) {
      this.logger.error(
        `❗Failed email verification with token: ${data.token} | Reason: ${error.message}`,
        // error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error while verifying email',
      });
    }
  }
  async resendVerification(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`📧 Resend verification requested for email: ${email}`);

    try {
      const user = await this.authRepository.findByEmail(email);

      // ✅ Silent fail for non-existing email (security best practice)
      if (!user || user.emailVerified) {
        this.logger.log(`⚠️ No action needed for email: ${email}`);
        return {
          success: true,
          message:
            'If your email is not verified, a verification email has been sent.',
        };
      }

      await this.authRepository.sendVerificationEmail(user.id, email);
      this.logger.log(`📧 Verification email resent to: ${email}`);

      return {
        success: true,
        message:
          'If your email is not verified, a verification email has been sent.',
      };
    } catch (error) {
      this.logger.error(
        `❗Failed to resend verification for email: ${email} | Reason: ${error.message}`,
        // error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Internal server error while resending verification email',
      });
    }
  }

  // ----------------- Helper -----------------
  private async generateTokens(user: User): Promise<AuthTokens> {
    try {
      this.logger.log(`🔑 Generating JWT tokens for userId: ${user.id}`);

      const payload = { sub: user.id, email: user.email };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      this.logger.log(`✅ Tokens generated for userId: ${user.id}`);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `❗Failed to generate tokens for userId: ${user.id} | Reason: ${error.message}`,
        // error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to generate authentication tokens',
      });
    }
  }

  async createSuperAdmin() {
    const user = await this.authRepository.createSuperAdmin();
  }
}
