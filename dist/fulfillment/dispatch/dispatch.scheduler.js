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
exports.DispatchScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const dispatch_repository_1 = require("./dispatch.repository");
const app_logger_service_1 = require("../../common/app-logger.service");
let DispatchScheduler = class DispatchScheduler {
    constructor(dispatchRepo, logger) {
        this.dispatchRepo = dispatchRepo;
        this.logger = logger;
    }
    async autoExpire() {
        this.logger.log('Running auto-expiration job...');
        try {
            const result = await this.dispatchRepo.expireAllExpiredPending();
            if (result.count > 0) {
                this.logger.warn(`Expired ${result.count} old assignment requests`);
            }
        }
        catch (e) {
            this.logger.error('Cron expiration failed', e.stack);
        }
    }
};
exports.DispatchScheduler = DispatchScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DispatchScheduler.prototype, "autoExpire", null);
exports.DispatchScheduler = DispatchScheduler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dispatch_repository_1.DispatchRepository,
        app_logger_service_1.AppLogger])
], DispatchScheduler);
//# sourceMappingURL=dispatch.scheduler.js.map