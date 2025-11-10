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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
let AuthRepository = class AuthRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    }
    async findByPhone(phone) {
        return this.prisma.user.findUnique({
            where: { phone },
            include: { role: true },
        });
    }
    async createNotificationPreferences(id) {
        return this.prisma.userNotificationPreferences.create({
            data: {
                user: { connect: { id } },
                email: true,
                inApp: true,
                push: false,
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async findRoleById(id) {
        return this.prisma.role.findUnique({ where: { id } });
    }
    async createUser(data, hashedPassword) {
        const { name, email, phone, branchId, role, customerType, companyName, taxId, contactPerson, contactPhone, contactEmail, industryType, website, address, notes, } = data;
        let customerCategory = null;
        if (customerType) {
            customerCategory = await this.prisma.customerCategory.findFirst({
                where: {
                    name: customerType === 'CORPORATE' ? 'CORPORATION' : 'INDIVIDUAL',
                },
            });
        }
        return this.prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                customerType: customerType
                    ? customerType === 'CORPORATE'
                        ? 'CORPORATE'
                        : 'INDIVIDUAL'
                    : undefined,
                role: { connect: { id: role } },
                branch: branchId ? { connect: { id: branchId } } : undefined,
                createdBy: 'system',
                customerCategory: customerCategory
                    ? { connect: { id: customerCategory.id } }
                    : undefined,
                corporateInfo: customerType === 'CORPORATE'
                    ? {
                        create: {
                            companyName: companyName ?? '',
                            taxId: taxId ?? null,
                            contactPerson: contactPerson ?? null,
                            contactPhone: contactPhone ?? null,
                            contactEmail: contactEmail ?? null,
                            industryType: industryType ?? null,
                            website: website ?? null,
                            address: address ?? null,
                            notes: notes ?? null,
                        },
                    }
                    : undefined,
            },
            include: {
                corporateInfo: true,
            },
        });
    }
    async saveRefreshToken(userId, token) {
        const hashedToken = await bcrypt.hash(token, 10);
        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId,
            },
        });
    }
    async findSessionByRefreshToken(userId, token) {
        const sessions = await this.prisma.refreshToken.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
        });
        for (const session of sessions) {
            const isValid = await bcrypt.compare(token, session.token);
            if (isValid)
                return session;
        }
        return null;
    }
    async removeRefreshToken(userId, sessionId) {
        if (sessionId) {
            await this.prisma.refreshToken.delete({ where: { id: sessionId } });
        }
        else {
            await this.prisma.refreshToken.deleteMany({ where: { userId } });
        }
    }
    async updateRefreshToken(userId, newToken, sessionId) {
        const hashedToken = await bcrypt.hash(newToken, 10);
        await this.prisma.refreshToken.update({
            where: { id: sessionId },
            data: { token: hashedToken, createdAt: new Date() },
        });
    }
    async updatePassword(userId, hashedPassword) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
    async generateResetToken(userId) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600 * 1000);
        await this.prisma.passwordReset.create({
            data: { userId, expiresAt },
        });
        return token;
    }
    async verifyResetToken(token) {
        const resetRecord = await this.prisma.passwordReset.findFirst({
            where: {
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!resetRecord)
            return null;
        return resetRecord.userId;
    }
    async invalidateResetToken(token) {
        await this.prisma.passwordReset.deleteMany({
            where: { expiresAt: { gt: new Date() } },
        });
    }
    async sendVerificationEmail(userId, email) {
        console.log(`Send verification email to ${email} for user ${userId}`);
    }
    async sendVerificationPhone(userId, email) {
        console.log(`Send verification email to ${email} for user ${userId}`);
    }
    async verifyEmailToken(token) {
        return null;
    }
    async markEmailAsVerified(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });
    }
    async sendResetPasswordEmail(email, token) {
        console.log(`Send password reset email to ${email}: token=${token}`);
    }
    async createSuperAdmin() {
        const existing = await this.prisma.user.findFirst({
            where: { isSuperAdmin: true },
        });
        if (existing) {
            return existing;
        }
        const hashedPassword = await bcrypt.hash('admin1111', 10);
        return this.prisma.user.create({
            data: {
                name: 'Super Admin',
                email: 'superadmin@gmail.com',
                password: hashedPassword,
                phone: '0000000000',
                isStaff: true,
                isSuperAdmin: true,
                role: {
                    create: {
                        name: 'SuperAdmin',
                        description: 'Full access to the system',
                    },
                },
            },
        });
    }
    async invalidateRefreshToken(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map