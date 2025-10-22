import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

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

    // ✅ Compute average delivery time (in hours)
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
            return sum + durationMs / (1000 * 60 * 60); // convert to hours
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

    // ✅ Calculate rates (percentages)
    const rate = (count: number) =>
      total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;

    // ✅ Calculate average delivery time for delivered shipments
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
            return sum + diffMs / (1000 * 60 * 60); // convert to hours
          }, 0) / deliveredOrders.length
        : 0;

    // ✅ Build performance summary
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
          const week = getWeekNumber(date); // helper function
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
    // 1️⃣ Fetch all branches (cached in memory)
    const branches = await this.prisma.branch.findMany({
      select: { id: true, name: true },
    });

    // 2️⃣ Group orders by branch and status (fewer DB calls)
    const orderStats = await this.prisma.order.groupBy({
      by: ['branchId', 'status'],
      _count: { id: true },
      where: {
        branchId: { in: branches.map((b) => b.id) },
        status: { in: ['DELIVERED', 'EXCEPTION'] },
      },
    });

    // 3️⃣ Get all active orders in one query (status filtering)
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

    // 4️⃣ Aggregate completed payments joined with orders
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

    // 5️⃣ Compute revenue by branch
    const revenueByBranch = payments.reduce(
      (acc, p) => {
        const branchId = p.order?.branchId;
        if (branchId) acc[branchId] = (acc[branchId] || 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 6️⃣ Merge results per branch
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

    // 7️⃣ Sort by revenue (descending)
    result.sort((a, b) => b.revenue - a.revenue);

    return { data: result };
  }

  async findBranchName() {
    return await this.prisma.branch.findMany({
      select: { id: true, name: true },
    });
  }

  async getDriverPerformance(branchId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 🧠 Get all drivers who have handled orders
      const drivers = await tx.driver.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              addresses: true,
            },
          },
        },
      });

      // 🧮 For each driver, fetch their orders
      const results = await Promise.all(
        drivers.map(async (driver) => {
          const orders = await tx.order.findMany({
            where: {
              OR: [
                { pickupDriverId: driver.userId },
                { deliveryDriverId: driver.userId },
              ],
              ...(branchId ? { branchId } : {}),
            },
            select: {
              status: true,
              createdAt: true,
              deliveryDate: true,
              updatedAt: true,
              // expectedDeliveryAt: true,
            },
          });

          const totalOrders = orders.length;
          const completedOrders = orders.filter(
            (o) => o.status === 'DELIVERED' || o.status === 'SUCCESS',
          );
          const failedOrders = totalOrders - completedOrders.length;

          // Calculate Avg. Delivery Time in minutes
          const avgDeliveryTime =
            completedOrders.length > 0
              ? completedOrders.reduce((sum, o) => {
                  const time =
                    o.deliveryDate && o.createdAt
                      ? (o.deliveryDate.getTime() - o.createdAt.getTime()) /
                        60000
                      : 0;
                  return sum + time;
                }, 0) / completedOrders.length
              : 0;

          // Calculate On-Time Delivery %
          const onTimeDeliveries = completedOrders.filter((o) =>
            o.updatedAt && o.deliveryDate
              ? o.updatedAt <= o.deliveryDate
              : false,
          ).length;
          const onTimePercent = totalOrders
            ? (onTimeDeliveries / totalOrders) * 100
            : 0;

          return {
            agentId: driver.userId,
            region: driver.user?.addresses[0]?.state || 'N/A',
            avgDeliveryTime: `${Math.round(avgDeliveryTime)} min`,
            status: failedOrders > 0 ? 'Failed' : 'Completed',
            onTimePercent: `${Math.round(onTimePercent)}%`,
          };
        }),
      );

      return results;
    });
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
        status: { in: ['DELIVERED', 'SUCCESS'] },
      },
    });

    return {
      driverUserId,
      totalOrders,
      deliveredOrders,
      successRate: totalOrders ? (deliveredOrders / totalOrders) * 100 : 0,
    };
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
