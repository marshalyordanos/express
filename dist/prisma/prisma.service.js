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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(config) {
        const databaseUrl = config.get('DATABASE_URL');
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is missing in .env');
        }
        const redactedUrl = databaseUrl.replace(/:(.*?)@/, ':[REDACTED]@');
        console.log('DATABASE_URL (redacted):', redactedUrl);
        super({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
            errorFormat: 'pretty',
        });
    }
    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✅ Prisma connected to Supabase (pooled connection)');
        }
        catch (error) {
            console.error('❌ Prisma connection failed:', error.message);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('🔌 Prisma disconnected from Supabase');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map