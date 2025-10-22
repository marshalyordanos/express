import { Injectable, Logger } from "@nestjs/common";
import { DashboardReportRepository } from "../repositories/dashboard.repository";

@Injectable()
export class DashboardReportService {
   private readonly logger = new Logger(DashboardReportService.name);

  constructor(private readonly dashboardRepo: DashboardReportRepository) {}

  /**
   * Returns key metrics for dashboard overview
   * e.g., total shipments, active, delivered, delayed, canceled, etc.
   */

  async getOverview(token: string) {
    this.logger.log('Fetching dashboard overview...');

    // (Optional) decode token or extract branch/user context here

    const overview = await this.dashboardRepo.getOverview();

    // You can also apply formatting/transformation here
    return {
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
  }


  async getShipmentPerformance() {
    return this.dashboardRepo.getShipmentPerformance();
  }

  async getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  return this.dashboardRepo.getRevenueTrends(period);
}

async getBranchPerformance(metric: string) {
  const result = await this.dashboardRepo.getBranchPerformance();
  return result;
}


async getDriverPerformance() {
  const result = await this.dashboardRepo.getDriverPerformance();
  return result;
}

  private calculateRate(delivered: number, total: number): number {
    return total === 0 ? 0 : +(delivered / total * 100).toFixed(2);
  }
}
