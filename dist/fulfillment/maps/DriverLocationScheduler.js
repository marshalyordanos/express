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
var DriverLocationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverLocationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const driver_location_service_1 = require("./driver-location.service");
const common_2 = require("@nestjs/common");
let DriverLocationScheduler = DriverLocationScheduler_1 = class DriverLocationScheduler {
    constructor(driverLocationService) {
        this.driverLocationService = driverLocationService;
        this.logger = new common_2.Logger(DriverLocationScheduler_1.name);
    }
    async handleCron() {
        try {
            await this.driverLocationService.syncToDatabase();
            await this.driverLocationService.updateOfflineDrivers();
        }
        catch (err) {
            this.logger.error(`Cron job failed: ${err.message}`, err.stack);
        }
    }
};
exports.DriverLocationScheduler = DriverLocationScheduler;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DriverLocationScheduler.prototype, "handleCron", null);
exports.DriverLocationScheduler = DriverLocationScheduler = DriverLocationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [driver_location_service_1.DriverLocationService])
], DriverLocationScheduler);
//# sourceMappingURL=DriverLocationScheduler.js.map