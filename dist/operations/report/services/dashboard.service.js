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
var DashboardReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardReportService = void 0;
const common_1 = require("@nestjs/common");
const dashboard_repository_1 = require("../repositories/dashboard.repository");
const redis_service_1 = require("../../../redis/redis.service");
const client_1 = require("@prisma/client");
let DashboardReportService = DashboardReportService_1 = class DashboardReportService {
    constructor(dashboardRepo, redis) {
        this.dashboardRepo = dashboardRepo;
        this.redis = redis;
        this.logger = new common_1.Logger(DashboardReportService_1.name);
    }
    async getOverview(token) {
        this.logger.log('Fetching dashboard overview...');
        const cacheKey = 'dashboard:overview';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log('✅ Returning cached overview data');
            return JSON.parse(cached);
        }
        const overview = await this.dashboardRepo.getOverview();
        const response = {
            summary: {
                totalOrders: overview.totalOrders,
                completed: overview.deliveredOrders,
                pending: overview.pendingOrders,
                failed: overview.failedOrders,
            },
            logistics: {
                totalDrivers: overview.totalDrivers,
                totalVehicles: overview.totalVehicles,
                totalBranches: overview.totalBranches,
            },
            revenue: {
                total: overview.totalRevenue,
            },
            meta: {
                generatedAt: new Date().toISOString(),
            },
        };
        await this.redis.set(cacheKey, JSON.stringify(response), { EX: 600 });
        return response;
    }
    async getShipmentPerformance() {
        return this.dashboardRepo.getShipmentPerformance();
    }
    async getRevenueTrends(period) {
        const cacheKey = `dashboard:revenue:${period}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log(`✅ Returning cached revenue (${period})`);
            return JSON.parse(cached);
        }
        const result = await this.dashboardRepo.getRevenueTrends(period);
        await this.redis.set(cacheKey, JSON.stringify(result), { EX: 1800 });
        return result;
    }
    async getBranchPerformance(metric) {
        const cacheKey = `dashboard:branch-performance`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log('✅ Returning cached branch performance');
            return JSON.parse(cached);
        }
        const result = await this.dashboardRepo.getBranchPerformance();
        await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 });
        return result;
    }
    async getDriverPerformance(branchId) {
        const cacheKey = branchId
            ? `dashboard:driver-performance:${branchId}`
            : 'dashboard:driver-performance:all';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log('✅ Returning cached driver performance');
            return JSON.parse(cached);
        }
        const result = await this.dashboardRepo.getDriverPerformance();
        await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 });
        return result;
    }
    async getBranchDashboardSummary() {
        const cacheKey = 'dashboard:branch:summary';
        const ttl = 3600;
        return this.cacheWrap(cacheKey, ttl, async () => {
            this.logger.log('Fetching fresh dashboard summary...');
            return this.dashboardRepo.getBranchDashboardSummary();
        });
    }
    async getStaffDashboardSummary() {
        const cacheKey = 'dashboard:staff:summary';
        const ttl = 600;
        return this.cacheWrap(cacheKey, ttl, async () => {
            this.logger.log('Fetching fresh staff dashboard summary...');
            return this.dashboardRepo.getStaffDashboardSummary();
        });
    }
    async getOrderDashboardSummary() {
        const cacheKey = 'dashboard:order:analytics';
        const ttlSeconds = 600;
        return this.cacheWrap(cacheKey, ttlSeconds, () => this.getOrderAnalytics());
    }
    async getOrderAnalytics() {
        const now = new Date();
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - now.getDay());
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(now.getDate() - 14);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalOrders, thisWeekOrders, lastWeekOrders, thisMonthOrders, lastMonthOrders, oneWeekDeliveredOrders, twoWeeksOrderCounts,] = await Promise.all([
            this.dashboardRepo.getTotalOrders(),
            this.dashboardRepo.getOrderCountBetween(startOfWeek, now),
            this.dashboardRepo.getOrderCountBetween(startOfLastWeek, startOfWeek),
            this.dashboardRepo.getOrderCountBetween(startOfMonth, now),
            this.dashboardRepo.getOrderCountBetween(startOfLastMonth, endOfLastMonth),
            this.dashboardRepo.getDeliveredOrders(startOfWeek, now),
            this.dashboardRepo.getOrderCounts(twoWeeksAgo, startOfWeek),
        ]);
        let onTimeCount = 0;
        let totalTOWNTime = 0;
        let totalREGIntlTime = 0;
        let townCount = 0;
        let regIntlCount = 0;
        for (const o of oneWeekDeliveredOrders) {
            if (!o.actualDeliveryAt || !o.actualPickupDate)
                continue;
            const durationHours = (new Date(o.actualDeliveryAt).getTime() -
                new Date(o.actualPickupDate).getTime()) /
                1000 /
                3600;
            if (o.shippingScope === 'TOWN') {
                townCount++;
                let allowedHours = 48;
                switch (o.serviceType) {
                    case 'SAME_DAY':
                        allowedHours = 8;
                        break;
                    case 'EXPRESS':
                        allowedHours = 12;
                        break;
                    case 'OVERNIGHT':
                        allowedHours = 18;
                        break;
                    case 'STANDARD':
                        allowedHours = 24;
                        break;
                }
                if (durationHours <= allowedHours)
                    onTimeCount++;
                totalTOWNTime += durationHours;
            }
            else {
                regIntlCount++;
                if (durationHours <= 120)
                    onTimeCount++;
                totalREGIntlTime += durationHours;
            }
        }
        const avgPickupToDeliveryTime = townCount
            ? +(totalTOWNTime / townCount).toFixed(2)
            : 0;
        const avgBranchProcessingTime = regIntlCount
            ? +(totalREGIntlTime / regIntlCount).toFixed(2)
            : 0;
        const onTimeRate = oneWeekDeliveredOrders.length
            ? +((onTimeCount / oneWeekDeliveredOrders.length) * 100).toFixed(2)
            : 0;
        const percentChange = (curr, prev) => prev === 0 ? 0 : +(((curr - prev) / prev) * 100).toFixed(2);
        return {
            totalOrders: {
                value: totalOrders,
                change: 0,
            },
            thisWeekOrders: {
                value: thisWeekOrders,
                change: percentChange(thisWeekOrders, lastWeekOrders),
            },
            thisMonthOrders: {
                value: thisMonthOrders,
                change: percentChange(thisMonthOrders, lastMonthOrders),
            },
            returnOrders: {
                value: twoWeeksOrderCounts.returnOrders,
                change: percentChange(twoWeeksOrderCounts.returnOrders, twoWeeksOrderCounts.returnOrders),
            },
            fulfilledOrders: {
                value: twoWeeksOrderCounts.fulfilledOrders,
                change: percentChange(twoWeeksOrderCounts.fulfilledOrders, twoWeeksOrderCounts.fulfilledOrders),
            },
            onTimeDeliveryRate: onTimeRate,
            avgPickupToDeliveryTime,
            avgBranchProcessingTime,
        };
    }
    async getCustomerAnalytics() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(now.getDate() - 14);
        const [totalCustomers, newThisMonth, newLastMonth, activeCustomers, corporateClients, newCorporateThisMonth, loyaltyMembers,] = await Promise.all([
            this.cacheWrap('dashboard:customer:total', 60, () => this.dashboardRepo.getTotalCustomers()),
            this.cacheWrap('dashboard:customer:newThisMonth', 60, () => this.dashboardRepo.getNewCustomers(startOfMonth, startOfNextMonth)),
            this.cacheWrap('dashboard:customer:newLastMonth', 60, () => this.dashboardRepo.getNewCustomers(startOfLastMonth, startOfMonth)),
            this.cacheWrap('dashboard:customer:active', 60, () => this.dashboardRepo.getActiveCustomers(twoWeeksAgo)),
            this.cacheWrap('dashboard:customer:corporateClients', 60, () => this.dashboardRepo.getCorporateClients()),
            this.cacheWrap('dashboard:customer:newCorporateThisMonth', 60, () => this.dashboardRepo.getNewCorporateClients(startOfMonth, startOfNextMonth)),
            this.cacheWrap('dashboard:customer:loyaltyMembers', 60, () => this.dashboardRepo.getLoyaltyMembers()),
        ]);
        const percentChange = (curr, prev) => (prev === 0 ? 100 : +(((curr - prev) / prev) * 100).toFixed(2));
        return {
            totalCustomers: {
                value: totalCustomers,
                newThisMonth,
                change: percentChange(newThisMonth, newLastMonth),
            },
            activeCustomers: {
                value: activeCustomers,
                rate: +((activeCustomers / totalCustomers) * 100).toFixed(2),
            },
            corporateClients: {
                value: corporateClients,
                newThisMonth: newCorporateThisMonth,
            },
            loyaltyMembers: {
                value: loyaltyMembers,
                note: 'High engagement',
            },
        };
    }
    parseJsonArray(jsonArray) {
        if (!jsonArray || !Array.isArray(jsonArray))
            return 0;
        return jsonArray.reduce((sum, item) => sum + (item.amount ?? item.value ?? 0), 0);
    }
    sumMetrics(logs) {
        let totalRevenue = 0;
        let totalProfit = 0;
        let totalSurcharge = 0;
        let totalDiscount = 0;
        let totalMiscFees = 0;
        let totalAirportFee = 0;
        logs.forEach(log => {
            totalRevenue += log.finalPrice;
            totalProfit += log.profit?.total ?? 0;
            totalSurcharge += this.parseJsonArray(log.surcharges);
            totalDiscount += this.parseJsonArray(log.discounts);
            totalMiscFees += this.parseJsonArray(log.miscFees);
            totalAirportFee += log.airportFee?.total ?? 0;
        });
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        return {
            totalRevenue,
            totalProfit,
            profitMargin,
            totalSurcharge,
            totalDiscount,
            totalMiscFees,
            totalAirportFee,
        };
    }
    async getReportOverview() {
        this.logger.log('Fetching price & revenue report overview...');
        const cacheKey = 'dashboard:price-revenue-overview';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log('✅ Returning cached price & revenue overview');
            return JSON.parse(cached);
        }
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfPrevDay = new Date(startOfDay);
        startOfPrevDay.setDate(startOfDay.getDate() - 1);
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [todayLogs, prevDayLogs, thisWeekLogs, prevWeekLogs, thisMonthLogs, prevMonthLogs,] = await Promise.all([
            this.dashboardRepo.getLogsBetween(startOfDay, now),
            this.dashboardRepo.getLogsBetween(startOfPrevDay, startOfDay),
            this.dashboardRepo.getLogsBetween(startOfWeek, now),
            this.dashboardRepo.getLogsBetween(startOfPrevWeek, startOfWeek),
            this.dashboardRepo.getLogsBetween(startOfMonth, now),
            this.dashboardRepo.getLogsBetween(startOfPrevMonth, endOfPrevMonth),
        ]);
        const report = {
            day: {
                current: this.sumMetrics(todayLogs),
                previous: this.sumMetrics(prevDayLogs),
            },
            week: {
                current: this.sumMetrics(thisWeekLogs),
                previous: this.sumMetrics(prevWeekLogs),
            },
            month: {
                current: this.sumMetrics(thisMonthLogs),
                previous: this.sumMetrics(prevMonthLogs),
            },
            meta: {
                generatedAt: new Date().toISOString(),
            },
        };
        await this.redis.set(cacheKey, JSON.stringify(report), { EX: 300 });
        return report;
    }
    async getFleetSummary() {
        return this.cacheWrap('fleet:summary', 60, async () => {
            const vehicles = await this.dashboardRepo.getVehicles();
            const total = vehicles.length;
            const inHouse = vehicles.filter(v => v.type === 'INTERNAL').length;
            const external = vehicles.filter(v => v.type === 'EXTERNAL').length;
            const active = vehicles.filter(v => v.status === client_1.VehicleStatus.ACTIVE).length;
            const activePercentage = total > 0 ? +(active / total * 100).toFixed(1) : 0;
            const maintenanceVehicles = vehicles
                .filter(v => v.status === client_1.VehicleStatus.MAINTENANCE)
                .map(v => v.plateNumber);
            const utilizationData = await this.dashboardRepo.getUtilizationStats();
            const totalUtil = utilizationData.reduce((sum, v) => sum + v.fleetLogs.length, 0);
            const avgUtilization = total > 0 ? +(totalUtil / total).toFixed(2) : 0;
            const utilizationChange = 5;
            return {
                totalVehicles: total,
                inHouse,
                external,
                activeVehicles: active,
                activePercentage,
                underMaintenance: maintenanceVehicles.length,
                maintenanceVehicles,
                avgUtilization,
                utilizationChange,
            };
        });
    }
    async getDispatchSummary() {
        return this.cacheWrap("dispatch:summary", 60, async () => {
            const dispatches = await this.dashboardRepo.getDispatches();
            const totalDispatches = dispatches.length;
            const byStatus = {};
            const byScope = {};
            const byServiceType = {};
            for (const d of dispatches) {
                byStatus[d.status] = (byStatus[d.status] || 0) + 1;
                byScope[d.scope] = (byScope[d.scope] || 0) + 1;
                byServiceType[d.serviceType] =
                    (byServiceType[d.serviceType] || 0) + 1;
            }
            const assignedToDrivers = dispatches.filter(d => d.driverId).length;
            const unassigned = totalDispatches - assignedToDrivers;
            const weights = dispatches.map(d => d.weight || 0);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            const avgWeightPerDispatch = totalDispatches ? +(totalWeight / totalDispatches).toFixed(2) : 0;
            let dispatchedOrders = 0;
            let completedOrders = 0;
            let failedOrders = 0;
            for (const d of dispatches) {
                dispatchedOrders += d.orders.length;
                completedOrders += d.orders.filter(o => o.status === "DELIVERED").length;
                failedOrders += d.orders.filter(o => o.status === "FAILED").length;
            }
            const vehicleSet = new Set(dispatches.map(d => d.vehicleId).filter(Boolean));
            const driverSet = new Set(dispatches.map(d => d.driverId).filter(Boolean));
            const vehiclesUsed = vehicleSet.size;
            const driversUsed = driverSet.size;
            const originBranches = new Set(dispatches.map(d => d.originId).filter(Boolean)).size;
            const destinationBranches = new Set(dispatches.map(d => d.destinationId).filter(Boolean)).size;
            const dispatchesToday = await this.dashboardRepo.getTodayDispatches();
            const dispatchesThisWeek = await this.dashboardRepo.getWeekDispatches();
            const activeDrivers = await this.dashboardRepo.getActiveDrivers();
            const activeDriversYesterday = await this.dashboardRepo.getActiveDriversYesterday();
            const activeDriverChange = activeDrivers - activeDriversYesterday;
            const deliveriesToday = await this.dashboardRepo.getDeliveriesToday();
            const deliveriesYesterday = await this.dashboardRepo.getDeliveriesYesterday();
            const deliveryChange = deliveriesYesterday ? +(((deliveriesToday - deliveriesYesterday) / deliveriesYesterday) * 100).toFixed(2) : 0;
            const onTime = await this.dashboardRepo.getOnTimeOrders();
            const totalDelivered = await this.dashboardRepo.getTotalDelivered();
            const onTimeRate = totalDelivered ? +(onTime / totalDelivered * 100).toFixed(2) : 0;
            const onTimeImprovement = 2;
            const routeEfficiency = await this.dashboardRepo.getRouteEfficiency();
            const routeEfficiencyChange = 5;
            return {
                totalDispatches,
                byStatus,
                byScope,
                byServiceType,
                assignedToDrivers,
                unassigned,
                avgWeightPerDispatch,
                totalWeight,
                dispatchedOrders,
                completedOrders,
                failedOrders,
                vehiclesUsed,
                driversUsed,
                originBranches,
                destinationBranches,
                dispatchesToday,
                dispatchesThisWeek,
                activeDrivers,
                activeDriverChange,
                deliveriesToday,
                deliveryChange,
                onTimeRate,
                onTimeImprovement,
                routeEfficiency,
                routeEfficiencyChange,
                utilizationChange: 7
            };
        });
    }
    async cacheWrap(key, ttl, fetcher) {
        const cached = await this.redis.get(key);
        if (cached)
            return JSON.parse(cached);
        const data = await fetcher();
        await this.redis.set(key, JSON.stringify(data), { EX: ttl });
        return data;
    }
};
exports.DashboardReportService = DashboardReportService;
exports.DashboardReportService = DashboardReportService = DashboardReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dashboard_repository_1.DashboardReportRepository,
        redis_service_1.RedisService])
], DashboardReportService);
//# sourceMappingURL=dashboard.service.js.map