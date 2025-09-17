// auth.usecase.impl.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  AuthMfaDto,
  AuthSession,
} from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { IResponse } from '../common/types';

@Injectable()
export class AuthUseCaseImpl implements AuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  // ----------------- Core Authentication -----------------
  async register(data: AuthRegisterDto): Promise<User> {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new RpcException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // Resolve roleId (default to CUSTOMER if not provided)
    const roleName = data.role || 'CUSTOMER';
    const role = await this.authRepository.findRoleByName(roleName);
    if (!role) {
      throw new RpcException(`Invalid role: ${roleName}`);
    }

    const user = await this.authRepository.createUser(
      data,
      role,
      hashedPassword,
    );

    // Send verification email (optional, implement in repository/service)
    await this.authRepository.sendVerificationEmail(user.id, user.email);
    delete user.password;

    return user;
  }

  async login(data: AuthLoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    console.log('=========================: 2');

    const user = await this.authRepository.findByEmail(data.email);
    console.log('=========================: 22', user);

    if (!user) {
      console.log('=========================: 22', user);

      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }
    console.log('=========================: ');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    }

    const tokens = await this.generateTokens(user);

    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);
    delete user.password;
    console.log('=========================: ', user, tokens);

    return { user, tokens };
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    await this.authRepository.removeRefreshToken(userId, sessionId);
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    console.log('tokens: ', refreshToken);
    const session = await this.authRepository.findSessionByRefreshToken(
      userId,
      refreshToken,
    );
    console.log('sessions: ', session);
    if (!session) {
      throw new RpcException('Invalid refresh token');
    }

    const user = await this.authRepository.findById(session.userId);
    if (!user) throw new RpcException('User not found');

    const tokens = await this.generateTokens(user);
    await this.authRepository.updateRefreshToken(
      user.id,
      tokens.refreshToken,
      session.id,
    );

    return tokens;
  }

  // ----------------- Password Management -----------------
  async changePassword(
    userId: string,
    data: AuthChangePasswordDto,
  ): Promise<any> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new RpcException('User not found');

    const isOldPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid)
      throw new RpcException('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.authRepository.updatePassword(userId, hashedPassword);
    // { message: 'Password changed successfully' }; // ✅ return success info
  }

  async forgotPassword(data: AuthForgotPasswordDto): Promise<void> {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) return; // silently ignore

    // Generate password reset token
    const resetToken = await this.authRepository.generateResetToken(user.id);

    // Send email
    await this.authRepository.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassword(data: AuthResetPasswordDto): Promise<void> {
    const userId = await this.authRepository.verifyResetToken(data.token);
    if (!userId) throw new RpcException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.authRepository.updatePassword(userId, hashedPassword);

    await this.authRepository.invalidateResetToken(data.token);
  }

  // ----------------- Email Verification -----------------
  async verifyEmail(data: AuthVerifyEmailDto): Promise<void> {
    const userId = await this.authRepository.verifyEmailToken(data.token);
    if (!userId) throw new RpcException('Invalid verification token');

    await this.authRepository.markEmailAsVerified(userId);
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return;

    if (user.emailVerified) return; // already verified

    await this.authRepository.sendVerificationEmail(user.id, email);
  }

  // ----------------- Helper -----------------
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
