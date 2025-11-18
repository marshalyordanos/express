import { Injectable, Logger } from '@nestjs/common';
import { DashboardReportRepository } from '../repositories/dashboard.repository';
import { RedisService } from '../../../redis/redis.service';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class DashboardReportService {
  // private readonly logger = new Logger(DashboardReportService.name);

  constructor(
    private readonly dashboardRepo: DashboardReportRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * Returns key metrics for dashboard overview
   * e.g., total shipments, active, delivered, delayed, canceled, etc.
   */

  async getOverview(token: string) {
    // this.logger.log('Fetching dashboard overview...');

    const cacheKey = 'dashboard:overview';

    // Try cache first if available
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // this.logger.log('✅ Returning cached overview data');
      return JSON.parse(cached as string);
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
    // ✅  Store in Redis (cache for 5 minutes)
    await this.redis.set(cacheKey, JSON.stringify(response), { EX: 600 });

    return response;
  }

  async getShipmentPerformance() {
    return this.dashboardRepo.getShipmentPerformance();
  }

  async getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const cacheKey = `dashboard:revenue:${period}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // this.logger.log(`✅ Returning cached revenue (${period})`);
      return JSON.parse(cached as string);
    }
    const result = await this.dashboardRepo.getRevenueTrends(period);
    await this.redis.set(cacheKey, JSON.stringify(result), { EX: 1800 }); // 30 min
    return result;
  }

  async getBranchPerformance(metric: string) {
    const cacheKey = `dashboard:branch-performance`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // this.logger.log('✅ Returning cached branch performance');
      return JSON.parse(cached as string);
    }

    const result = await this.dashboardRepo.getBranchPerformance();
    await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 }); // 10 min
    return result;
  }

  async getDriverPerformance(branchId: string) {
    const cacheKey = branchId
      ? `dashboard:driver-performance:${branchId}`
      : 'dashboard:driver-performance:all';

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // this.logger.log('✅ Returning cached driver performance');
      return JSON.parse(cached as string);
    }

    const result = await this.dashboardRepo.getDriverPerformance();
    await this.redis.set(cacheKey, JSON.stringify(result), { EX: 600 }); // 10 min
    return result;
  }

  async getBranchDashboardSummary() {
    const cacheKey = 'dashboard:branch:summary';
    const ttl = 3600; // 10 minutes

    return this.cacheWrap(cacheKey, ttl, async () => {
      // this.logger.log('Fetching fresh dashboard summary...');
      return this.dashboardRepo.getBranchDashboardSummary();
    });
  }
  async getStaffDashboardSummary() {
    const cacheKey = 'dashboard:staff:summary';
    const ttl = 600; // 10 min

    return this.cacheWrap(cacheKey, ttl, async () => {
      // this.logger.log('Fetching fresh staff dashboard summary...');
      return this.dashboardRepo.getStaffDashboardSummary();
    });
  }

  async getOrderDashboardSummary() {
    const cacheKey = 'dashboard:order:analytics';
    const ttlSeconds = 600; // 10 minutes
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

    const [
      totalOrders,
      thisWeekOrders,
      lastWeekOrders,
      thisMonthOrders,
      lastMonthOrders,
      oneWeekDeliveredOrders,
      twoWeeksOrderCounts,
    ] = await Promise.all([
      this.dashboardRepo.getTotalOrders(),
      this.dashboardRepo.getOrderCountBetween(startOfWeek, now),
      this.dashboardRepo.getOrderCountBetween(startOfLastWeek, startOfWeek),
      this.dashboardRepo.getOrderCountBetween(startOfMonth, now),
      this.dashboardRepo.getOrderCountBetween(startOfLastMonth, endOfLastMonth),
      this.dashboardRepo.getDeliveredOrders(startOfWeek, now),
      this.dashboardRepo.getOrderCounts(twoWeeksAgo, startOfWeek),
    ]);

    // On-time delivery calculation
    let onTimeCount = 0;
    let totalTOWNTime = 0;
    let totalREGIntlTime = 0;
    let townCount = 0;
    let regIntlCount = 0;

    for (const o of oneWeekDeliveredOrders) {
      if (!o.actualDeliveryAt || !o.actualPickupDate) continue;
      const durationHours =
        (new Date(o.actualDeliveryAt).getTime() -
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
        if (durationHours <= allowedHours) onTimeCount++;
        totalTOWNTime += durationHours;
      } else {
        regIntlCount++;
        if (durationHours <= 120) onTimeCount++;
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

    const percentChange = (curr: number, prev: number) =>
      prev === 0 ? 0 : +(((curr - prev) / prev) * 100).toFixed(2);

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
        change: percentChange(
          twoWeeksOrderCounts.returnOrders,
          twoWeeksOrderCounts.returnOrders,
        ), 
      },
      fulfilledOrders: {
        value: twoWeeksOrderCounts.fulfilledOrders,
        change: percentChange(
          twoWeeksOrderCounts.fulfilledOrders,
          twoWeeksOrderCounts.fulfilledOrders,
        ),
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

    const [
      totalCustomers,
      newThisMonth,
      newLastMonth,
      activeCustomers,
      corporateClients,
      newCorporateThisMonth,
      loyaltyMembers,
    ] = await Promise.all([
      this.cacheWrap('dashboard:customer:total', 60, () => this.dashboardRepo.getTotalCustomers()),
      this.cacheWrap('dashboard:customer:newThisMonth', 60, () => this.dashboardRepo.getNewCustomers(startOfMonth, startOfNextMonth)),
      this.cacheWrap('dashboard:customer:newLastMonth', 60, () => this.dashboardRepo.getNewCustomers(startOfLastMonth, startOfMonth)),
      this.cacheWrap('dashboard:customer:active', 60, () => this.dashboardRepo.getActiveCustomers(twoWeeksAgo)),
      this.cacheWrap('dashboard:customer:corporateClients', 60, () => this.dashboardRepo.getCorporateClients()),
      this.cacheWrap('dashboard:customer:newCorporateThisMonth', 60, () => this.dashboardRepo.getNewCorporateClients(startOfMonth, startOfNextMonth)),
      this.cacheWrap('dashboard:customer:loyaltyMembers', 60, () => this.dashboardRepo.getLoyaltyMembers()),
    ]);

    const percentChange = (curr: number, prev: number) => (prev === 0 ? 100 : +(((curr - prev) / prev) * 100).toFixed(2));

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


    private parseJsonArray(jsonArray: any[]): number {
    if (!jsonArray || !Array.isArray(jsonArray)) return 0;
    return jsonArray.reduce((sum, item) => sum + (item.amount ?? item.value ?? 0), 0);
  }

  private sumMetrics(logs: any[]) {
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
    // this.logger.log('Fetching price & revenue report overview...');

    const cacheKey = 'dashboard:price-revenue-overview';

    // Try Redis cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      // this.logger.log('✅ Returning cached price & revenue overview');
      return JSON.parse(cached as string);
    }

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfPrevDay = new Date(startOfDay); startOfPrevDay.setDate(startOfDay.getDate() - 1);

    const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfPrevWeek = new Date(startOfWeek); startOfPrevWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      todayLogs,
      prevDayLogs,
      thisWeekLogs,
      prevWeekLogs,
      thisMonthLogs,
      prevMonthLogs,
    ] = await Promise.all([
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

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(report), { EX: 300 });

    return report;
  }


 // ✅ Full Fleet Summary
  async getFleetSummary() {
    return this.cacheWrap('fleet:summary', 60, async () => {
      const vehicles = await this.dashboardRepo.getVehicles();

      const total = vehicles.length;
      // ✅ 1. In-house vs External
      const inHouse = vehicles.filter(v => v.type === 'INTERNAL').length;
      const external = vehicles.filter(v => v.type === 'EXTERNAL').length;

      // ✅ 2. Active Vehicles
      const active = vehicles.filter(v => v.status === VehicleStatus.ACTIVE).length;
      const activePercentage = total > 0 ? +(active / total * 100).toFixed(1) : 0;

      // ✅ 3. Under Maintenance
      const maintenanceVehicles = vehicles
        .filter(v => v.status === VehicleStatus.MAINTENANCE)
        .map(v => v.plateNumber);

      // ✅ 4. Avg Utilization (example: based on total logs cost)
      const utilizationData = await this.dashboardRepo.getUtilizationStats();
      const totalUtil = utilizationData.reduce((sum, v) => sum + v.fleetLogs.length, 0);
      const avgUtilization = total > 0 ? +(totalUtil / total).toFixed(2) : 0;

      // ✅ 5. Mock Change From Last Month (adjust as needed)
      const utilizationChange = 5; // e.g. +5%

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

    // ✅ existing dispatch analytics
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

    // ✅ NEW KPIs -------------------------------------------------

    const activeDrivers = await this.dashboardRepo.getActiveDrivers();
    const activeDriversYesterday = await this.dashboardRepo.getActiveDriversYesterday();
    const activeDriverChange = activeDrivers - activeDriversYesterday;

    const deliveriesToday = await this.dashboardRepo.getDeliveriesToday();
    const deliveriesYesterday = await this.dashboardRepo.getDeliveriesYesterday();
    const deliveryChange = deliveriesYesterday ? +(((deliveriesToday - deliveriesYesterday) / deliveriesYesterday) * 100).toFixed(2) : 0;

    const onTime = await this.dashboardRepo.getOnTimeOrders();
    const totalDelivered = await this.dashboardRepo.getTotalDelivered();
    const onTimeRate = totalDelivered ? +(onTime / totalDelivered * 100).toFixed(2) : 0;
    const onTimeImprovement = 2; // you can calculate historically if needed

    const routeEfficiency = await this.dashboardRepo.getRouteEfficiency();
    const routeEfficiencyChange = 5; // static for now

    return {
      // ✅ dispatch data
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

      // ✅ new driver & delivery KPIs
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

  // Redis cache wrapper
  private async cacheWrap<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached as string);

    const data = await fetcher();
    await this.redis.set(key, JSON.stringify(data), { EX: ttl });
    return data;
  }
}
