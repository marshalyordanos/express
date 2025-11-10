import { Injectable } from '@nestjs/common';
import { DispatchStatus, OrderStatus, PaymentStatus, ServiceType, ShippingScope, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

type OptimizedOrderPayload = {
  optimizedDistance?: number;
  optimizedTime?: number;
  [key: string]: any;
};
@Injectable()
export class DashboardReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate core shipment statistics for dashboard overview
   */
  async getOverview() {
    const [
      totalOrders,
      pendingOrders,
      canceledOrders,
      deliveredOrders,
      failedOrders,
      totalRevenue,
      totalDrivers,
      totalVehicles,
      totalBranches,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: {
          NOT: {
            status: {
              in: [
                OrderStatus.EXCEPTION,
                OrderStatus.CANCELED,
                OrderStatus.FAILED,
                OrderStatus.DELIVERED,
                OrderStatus.REJECTED,
              ],
            },
          },
        },
      }),

      this.prisma.order.count({
        where: { status: OrderStatus.CANCELED },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.DELIVERED },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.FAILED },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.driver.count(),
      this.prisma.vehicle.count(),
      this.prisma.branch.count(),
    ]);

    // Compute average delivery time (in hours)
    const deliveredOrdersData = await this.prisma.order.findMany({
      select: { pickupDate: true, deliveryDate: true },
      where: {
        deliveryDate: { not: null },
        pickupDate: { not: null },
        status: OrderStatus.DELIVERED,
      },
    });

    const avgDeliveryTimeHours =
      deliveredOrdersData.length > 0
        ? deliveredOrdersData.reduce((sum, o) => {
            const durationMs =
              new Date(o.deliveryDate).getTime() -
              new Date(o.pickupDate).getTime();
            return sum + durationMs / (1000 * 60 * 60);
          }, 0) / deliveredOrdersData.length
        : 0;

    return {
      totalOrders,
      pendingOrders,
      canceledOrders,
      deliveredOrders,
      failedOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalDrivers,
      totalVehicles,
      totalBranches,
      avgDeliveryTimeHours: Number(avgDeliveryTimeHours.toFixed(2)),
    };
  }

  async getShipmentPerformance() {
    // Get total and categorized shipment counts
    const [total, delivered, failed, canceled, exception] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'FAILED' } }),
      this.prisma.order.count({ where: { status: 'CANCELED' } }),
      this.prisma.order.count({ where: { status: 'EXCEPTION' } }),
    ]);

    // Calculate rates (percentages)
    const rate = (count: number) =>
      total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;

    // Calculate average delivery time for delivered shipments
    const deliveredOrders = await this.prisma.order.findMany({
      select: { pickupDate: true, deliveryDate: true },
      where: {
        deliveryDate: { not: null },
        pickupDate: { not: null },
        status: 'DELIVERED',
      },
    });

    const avgDeliveryTimeHours =
      deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, o) => {
            const diffMs =
              new Date(o.deliveryDate).getTime() -
              new Date(o.pickupDate).getTime();
            return sum + diffMs / (1000 * 60 * 60);
          }, 0) / deliveredOrders.length
        : 0;

    // Build performance summary
    return {
      totalShipments: total,
      deliveredShipments: delivered,
      failedShipments: failed,
      canceledShipments: canceled,
      exceptionShipments: exception,

      deliveryRate: rate(delivered),
      failureRate: rate(failed),
      cancellationRate: rate(canceled),
      exceptionRate: rate(exception),

      avgDeliveryTimeHours: Number(avgDeliveryTimeHours.toFixed(2)),
    };
  }
  async getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    // Fetch all completed payments
    const payments = await this.prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    // Group payments based on the selected period
    const grouped: Record<string, number> = {};

    payments.forEach((p) => {
      let key: string;

      const date = new Date(p.createdAt);

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly': {
          const year = date.getUTCFullYear();
          const week = getWeekNumber(date);
          key = `${year}-W${week}`;
          break;
        }
        case 'monthly':
          key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        case 'yearly':
          key = `${date.getUTCFullYear()}`; // YYYY
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      grouped[key] = (grouped[key] || 0) + p.amount;
    });

    // Convert to array and sort by period
    const revenueData = Object.entries(grouped)
      .map(([period, totalRevenue]) => ({ period, totalRevenue }))
      .sort((a, b) => (a.period > b.period ? 1 : -1));

    return revenueData;
  }

  async getBranchPerformance() {
    // Fetch all branches and their names
    const branches = await this.prisma.branch.findMany({
      select: { id: true, name: true },
    });

    // Group orders by branch and status and count
    const orderStats = await this.prisma.order.groupBy({
      by: ['branchId', 'status'],
      _count: { id: true },
      where: {
        branchId: { in: branches.map((b) => b.id) },
        status: { in: ['DELIVERED', 'EXCEPTION'] },
      },
    });

    // Get all active orders in one query
    const activeOrders = await this.prisma.order.findMany({
      where: {
        branchId: { in: branches.map((b) => b.id) },
        NOT: {
          status: {
            in: ['EXCEPTION', 'CANCELED', 'FAILED', 'DELIVERED', 'REJECTED'],
          },
        },
      },
      select: { branchId: true },
    });

    // Aggregate completed payments joined with orders
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        order: { branchId: { in: branches.map((b) => b.id) } },
      },
      select: {
        amount: true,
        order: { select: { branchId: true } },
      },
    });

    // Compute revenue by branch
    const revenueByBranch = payments.reduce(
      (acc, p) => {
        const branchId = p.order?.branchId;
        if (branchId) acc[branchId] = (acc[branchId] || 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Merge results per branch
    const result = branches.map((branch) => {
      const stats = orderStats.filter((o) => o.branchId === branch.id);

      const completedOrders =
        stats.find((s) => s.status === 'DELIVERED')?._count.id || 0;
      const delayedOrders =
        stats.find((s) => s.status === 'EXCEPTION')?._count.id || 0;

      const revenue = revenueByBranch[branch.id] || 0;
      const activeOrderCount = activeOrders.filter(
        (o) => o.branchId === branch.id,
      ).length;

      const totalOrders = completedOrders + delayedOrders + activeOrderCount;
      const efficiency =
        totalOrders === 0
          ? 0
          : Math.round((completedOrders / totalOrders) * 100);

      const trend =
        efficiency >= 85
          ? 'Improving'
          : efficiency >= 70
            ? 'Stable'
            : 'Declining';

      return {
        branchName: branch.name,
        activeOrders: activeOrderCount,
        completedOrders,
        delayedOrders,
        revenue,
        efficiency,
        trend,
      };
    });

    // Sort by revenue (descending)
    result.sort((a, b) => b.revenue - a.revenue);

    return { data: result };
  }

   async getVehicles(filter?: {
    status?: VehicleStatus;
    type?: string;
    driverId?: string;
  }) {
    return this.prisma.vehicle.findMany({
      where: {
        status: filter?.status,
        type: filter?.type,
        driverId: filter?.driverId,
      },
      include: {
        fleetLogs: true,
        driver: true,
      },
    });
  }

  // ✅ Drivers that are active today
async getActiveDrivers() {
  return this.prisma.driver.count({
    where: {
      status: { in: ["ONLINE", "AVAILABLE", "ENROUTE"] }
    }
  });
}

// ✅ Active drivers yesterday
async getActiveDriversYesterday() {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return this.prisma.driver.count({
    where: {
      updatedAt: { gte: start, lte: end },
      status: { in: ["ONLINE", "AVAILABLE", "ENROUTE"] }
    }
  });
}

// ✅ Deliveries today
async getDeliveriesToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return this.prisma.order.count({
    where: {
      status: "DELIVERED",
      actualDeliveryAt: { gte: start }
    }
  });
}

// ✅ Deliveries yesterday
async getDeliveriesYesterday() {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return this.prisma.order.count({
    where: {
      status: "DELIVERED",
      actualDeliveryAt: { gte: start, lte: end }
    }
  });
}


  // ✅ Fetch all dispatches (with optional filters)
  async getDispatches(filters?: {
    status?: DispatchStatus;
    scope?: ShippingScope;
    serviceType?: ServiceType;
    driverId?: string;
    vehicleId?: string;
    from?: Date;
    to?: Date;
  }) {
    return this.prisma.batchDispatch.findMany({
      where: {
        status: filters?.status,
        scope: filters?.scope,
        serviceType: filters?.serviceType,
        driverId: filters?.driverId,
        vehicleId: filters?.vehicleId,
        createdAt: filters?.from
          ? { gte: filters.from, lte: filters.to ?? new Date() }
          : undefined,
      },
      include: {
        orders: true,
        driver: true,
        vehicle: true,
        origin: true,
        destination: true,
      },
    });
  }

  // ✅ Quick count for today
  async getTodayDispatches() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return this.prisma.batchDispatch.count({
      where: {
        createdAt: { gte: start },
      },
    });
  }

  // ✅ Quick count for this week
  async getWeekDispatches() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday → start of week
    weekStart.setHours(0, 0, 0, 0);

    return this.prisma.batchDispatch.count({
      where: {
        createdAt: { gte: weekStart },
      },
    });
  }

  // ✅ Query for order status analytics
  async getOrderStats() {
    return this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });
  }

// ✅ On-time orders
async getOnTimeOrders() {
  return this.prisma.order.count({
    where: {
      status: "DELIVERED",
      actualDeliveryAt: { lte: new Date() },
      NOT: { estimatedDeliveryAt: null },
      AND: { actualDeliveryAt: { lte: this.prisma.order.fields.estimatedDeliveryAt } }
    }
  });
}

// ✅ Total delivered orders
async getTotalDelivered() {
  return this.prisma.order.count({
    where: {
      status: "DELIVERED"
    }
  });
}

// ✅ Route efficiency: optimized vs actual
async getRouteEfficiency() {
  const jobs = await this.prisma.optimizationJob.findMany({
    where: { status: "COMPLETED" },
    select: {
      totalDistance: true,
      optimizedOrder: true
    }
  });

let optimized = 0;
let actual = 0;

for (const job of jobs) {
  const data = (job.optimizedOrder ?? {}) as Record<string, any>;

  const optDist = typeof data.optimizedDistance === 'number' ? data.optimizedDistance : 0;
  const actualDist = typeof job.totalDistance === 'number' ? job.totalDistance : 0;

  optimized += optDist;
  actual += actualDist;
}

  if (actual === 0) return 0;
  return +(optimized / actual * 100).toFixed(2);
}

  // Fetch last month utilization (example query — modify if needed)
  async getUtilizationStats() {
    return this.prisma.vehicle.findMany({
      select: {
        id: true,
        fleetLogs: {
          where: {
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          select: { cost: true },
        },
      },
    });
  }

  async findBranchName() {
    return await this.prisma.branch.findMany({
      select: { id: true, name: true },
    });
  }

  async getDriverPerformance(branchId?: string) {
    // Fetch all drivers (optionally by branch)
    const drivers = await this.prisma.user.findMany({
      where: {
        driver: { isNot: null },
        ...(branchId && { branchId }),
      },
      select: {
        id: true,
        name: true,
        branch: { select: { name: true } },
      },
    });

    if (drivers.length === 0) return [];

    // Initialize stats for each driver
    const driverStats = new Map<
      string,
      {
        driverId: string;
        handledOrders: number;
        completedOrders: number;
        failedOrders: number;
        onTimeCount: number;
        totalMinutes: number;
        totalDistance: number;
        pickupHandled: number;
        deliveryHandled: number;
      }
    >();

    for (const driver of drivers) {
      driverStats.set(driver.id, {
        driverId: driver.id,
        handledOrders: 0,
        completedOrders: 0,
        failedOrders: 0,
        onTimeCount: 0,
        totalMinutes: 0,
        totalDistance: 0,
        pickupHandled: 0,
        deliveryHandled: 0,
      });

      // Fetch orders assigned to this driver for pickup or delivery
      const orders = await this.prisma.order.findMany({
        where: {
          OR: [{ pickupDriverId: driver.id }, { deliveryDriverId: driver.id }],
          ...(branchId && { branchId }),
        },
        select: {
          id: true,
          pickupDriverId: true,
          deliveryDriverId: true,
          pickupConfirmed: true,
          dropoffConfirmed: true,
          status: true,
          actualPickupDate: true,
          actualDeliveryAt: true,
          pickupDate: true,
          estimatedDeliveryAt: true,
          distance: true,
        },
      });

      if (orders.length === 0) continue;

      const stat = driverStats.get(driver.id)!;

      for (const order of orders) {
        stat.handledOrders++;

        // Pickup handling
        if (order.pickupDriverId === driver.id) {
          stat.pickupHandled++;

          const pickupOnTime =
            order.actualPickupDate &&
            order.pickupDate &&
            order.actualPickupDate <= order.pickupDate;

          if (pickupOnTime) stat.onTimeCount++;

          if (order.pickupConfirmed) stat.completedOrders++;
          else stat.failedOrders++;
        }

        // Delivery handling
        if (order.deliveryDriverId === driver.id) {
          stat.deliveryHandled++;
          stat.totalDistance += order.distance ?? 0;

          if (order.actualPickupDate && order.actualDeliveryAt) {
            const duration =
              (new Date(order.actualDeliveryAt).getTime() -
                new Date(order.actualPickupDate).getTime()) /
              60000;
            stat.totalMinutes += duration;

            const deliveryOnTime =
              order.actualDeliveryAt &&
              order.estimatedDeliveryAt &&
              order.actualDeliveryAt <= order.estimatedDeliveryAt;
            if (deliveryOnTime) stat.onTimeCount++;
          }

          if (['PICKED_UP', 'DELIVERED'].includes(order.status))
            stat.completedOrders++;
          else stat.failedOrders++;
        }
      }

      driverStats.set(driver.id, stat);
    }

    // Build performance report
    const report = drivers.map((driver) => {
      const stat = driverStats.get(driver.id)!;

      const avgTime =
        stat.totalMinutes && stat.totalDistance
          ? Number((stat.totalMinutes / stat.totalDistance).toFixed(2))
          : 0;

      const onTimePercent = stat.handledOrders
        ? Number(((stat.onTimeCount / stat.handledOrders) * 100).toFixed(2))
        : 0;

      const status =
        stat.failedOrders > stat.completedOrders ? 'Underperforming' : 'Good';

      return {
        driverId: driver.id,
        driverName: driver.name ?? 'Unknown',
        branch: driver.branch?.name ?? 'Unknown',
        handledOrders: stat.handledOrders,
        pickupHandled: stat.pickupHandled,
        deliveryHandled: stat.deliveryHandled,
        completedOrders: stat.completedOrders,
        failedOrders: stat.failedOrders,
        avgTimePerKm: avgTime,
        onTimePercent,
        performanceStatus: status,
      };
    });

    //  Sort by best performers
    return report.sort(
      (a, b) =>
        b.completedOrders - a.completedOrders ||
        b.onTimePercent - a.onTimePercent,
    );
  }

  async getDriverSuccessRate(driverUserId: string) {
    const totalOrders = await this.prisma.order.count({
      where: {
        OR: [
          { pickupDriverId: driverUserId },
          { deliveryDriverId: driverUserId },
        ],
      },
    });

    const deliveredOrders = await this.prisma.order.count({
      where: {
        OR: [
          { pickupDriverId: driverUserId },
          { deliveryDriverId: driverUserId },
        ],
        status: { in: ['DELIVERED', 'PICKED_UP'] },
      },
    });

    return {
      driverUserId,
      totalOrders,
      deliveredOrders,
      successRate: totalOrders ? (deliveredOrders / totalOrders) * 100 : 0,
    };
  }

  async getBranchDashboardSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Branch stats
    const [totalBranches, newBranchesThisMonth] = await Promise.all([
      this.prisma.branch.count(),
      this.prisma.branch.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    // Active orders this month & last month
    const [activeOrdersThisMonth, activeOrdersLastMonth] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: {
            notIn: ['CANCELED', 'DELIVERED', 'FAILED', 'EXCEPTION', 'REJECTED'],
          },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          status: {
            notIn: ['CANCELED', 'DELIVERED', 'FAILED', 'EXCEPTION', 'REJECTED'],
          },
        },
      }),
    ]);

    const activeOrdersPercentChange = activeOrdersLastMonth
      ? Math.round(
          ((activeOrdersThisMonth - activeOrdersLastMonth) /
            activeOrdersLastMonth) *
            100,
        )
      : 0;

    //  Staff stats
    const [totalStaff, newStaffThisMonth] = await Promise.all([
      this.prisma.user.count({ where: { isStaff: true } }),
      this.prisma.user.count({
        where: { isStaff: true, createdAt: { gte: startOfMonth } },
      }),
    ]);

    //  Manager vacancies: branches without assigned manager
    const managerVacancies = await this.prisma.branch.count({
      where: { managerId: null },
    });

    return {
      totalBranches: {
        value: totalBranches,
        newThisMonth: newBranchesThisMonth,
      },
      activeOrders: {
        value: activeOrdersThisMonth,
        percentChange: activeOrdersPercentChange,
      },
      totalStaff: { value: totalStaff, newThisMonth: newStaffThisMonth },
      managerVacancies: { value: managerVacancies, note: 'Need assignment' },
    };
  }

  async getStaffDashboardSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 7);

    //  Total staff & new hires this month
    const [totalStaff, newStaffThisMonth] = await Promise.all([
      this.prisma.user.count({ where: { isStaff: true } }),
      this.prisma.user.count({
        where: { isStaff: true, createdAt: { gte: startOfMonth } },
      }),
    ]);

    // Active staff: users who logged in within last 7 days
    const activeStaffRecords = await this.prisma.refreshToken.findMany({
      where: {
        createdAt: { gte: startOfLastWeek },
        user: { isStaff: true },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const activeStaff = activeStaffRecords.length;

    //  Active staff last week
    const lastWeekRecords = await this.prisma.refreshToken.findMany({
      where: {
        createdAt: {
          gte: new Date(startOfLastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: startOfLastWeek,
        },
        user: { isStaff: true },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const lastWeekActive = lastWeekRecords.length;

    const activeRate = totalStaff
      ? Math.round((activeStaff / totalStaff) * 100)
      : 0;
    const onLeaveChange = lastWeekActive ? lastWeekActive - activeStaff : 0;

    //  Staff on leave
    const onLeave = totalStaff - activeStaff;

    //  Branches covered (branches with at least one staff assigned)
    const branchesCovered = await this.prisma.branch.count({
      where: {
        staff: { some: { isStaff: true } },
      },
    });

    return {
      totalStaff: { value: totalStaff, newThisMonth: newStaffThisMonth },
      activeStaff: { value: activeStaff, activeRate },
      onLeave: { value: onLeave, changeFromLastWeek: onLeaveChange },
      branchesCovered: {
        value: branchesCovered,
        note: branchesCovered === totalStaff ? 'All branches staffed' : '',
      },
    };
  }

  async getTotalOrders() {
    return this.prisma.order.count();
  }

  async getOrderCountBetween(start: Date, end: Date) {
    return this.prisma.order.count({
      where: { createdAt: { gte: start, lt: end } },
    });
  }

  async getDeliveredOrders(start: Date, end: Date) {
    return this.prisma.order.findMany({
      where: { status: 'DELIVERED', actualDeliveryAt: { gte: start, lt: end } },
      select: {
        actualPickupDate: true,
        actualDeliveryAt: true,
        shippingScope: true,
        serviceType: true,
      },
    });
  }

  async getOrderCounts(start: Date, end: Date) {
    const [totalOrders, returnOrders, fulfilledOrders] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: start, lt: end } },
      }),
      this.prisma.order.count({
        where: { status: 'CANCELED', createdAt: { gte: start, lt: end } },
      }),
      this.prisma.order.count({
        where: { status: 'DELIVERED', createdAt: { gte: start, lt: end } },
      }),
    ]);

    return { totalOrders, returnOrders, fulfilledOrders };
  }

  async getOrderCountsByPeriod() {
    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalOrders = await this.prisma.order.count();
    const thisWeek = await this.prisma.order.count({
      where: { createdAt: { gte: startOfWeek, lt: now } },
    });
    const lastWeek = await this.prisma.order.count({
      where: { createdAt: { gte: startOfLastWeek, lt: startOfWeek } },
    });
    const thisMonth = await this.prisma.order.count({
      where: { createdAt: { gte: startOfMonth, lt: now } },
    });
    const lastMonth = await this.prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lt: endOfLastMonth } },
    });

    return { totalOrders, thisWeek, lastWeek, thisMonth, lastMonth };
  }

  // Total customers
  async getTotalCustomers() {
    return this.prisma.user.count({
      where: {
        customerType: 'INDIVIDUAL',
        isStaff: false,
        isSuperAdmin: false,
      },
    });
  }

  // Customers created in a date range
  async getNewCustomers(start: Date, end: Date) {
    return this.prisma.user.count({
      where: {
        customerType: 'INDIVIDUAL',
        isStaff: false,
        isSuperAdmin: false,
        createdAt: { gte: start, lt: end },
      },
    });
  }

  // Active customers in last 2 weeks
  async getActiveCustomers(since: Date) {
    const activeCustomers = await this.prisma.user.count({
      where: {
        isStaff: false,
        isSuperAdmin: false,
        customerType: { not: null },
        orders: {
          some: {
            createdAt: { gte: since }, // At least one order in period
          },
        },
      },
    });

    return activeCustomers;
  }

  // Corporate clients
  async getCorporateClients() {
    return this.prisma.user.count({
      where: {
        customerType: 'CORPORATE',
        isStaff: false,
        isSuperAdmin: false,
        corporateInfo: { isNot: null },
      },
    });
  }

  async getNewCorporateClients(start: Date, end: Date) {
    return this.prisma.user.count({
      where: {
        customerType: 'CORPORATE',
        isStaff: false,
        isSuperAdmin: false,
        corporateInfo: { isNot: null },
        createdAt: { gte: start, lt: end },
      },
    });
  }

  // Loyalty members (example: customers with >10 order)
  async getLoyaltyMembers(minOrders = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        isStaff: false,
        isSuperAdmin: false,
        customerType: { not: null },
      },
      include: { orders: true },
    });

    const loyalUsers = users.filter((u) => u.orders.length >= minOrders);
    return loyalUsers.length;
  }

  /**
   * Fetch all price calculation logs between two dates.
   * Includes order relation for potential future filtering/grouping.
   */
  async getLogsBetween(start: Date, end: Date) {
    return this.prisma.priceCalculationLog.findMany({
      where: {
        createdAt: {
          gte: start, // greater than or equal to start
          lte: end, // less than or equal to end
        },
      },
      include: {
        order: true, // include the related order
      },
    });
  }
}

/**
 * Helper: Get ISO week number
 */
function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
