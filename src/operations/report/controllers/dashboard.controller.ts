import { Injectable, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckPermission } from '../../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../../common/permission.guard';
import { PATTERNS } from '../../../contracts';
import { PermissionActions } from '../../../contracts/permission-actions.enum';
import { DashboardReportService } from '../services/dashboard.service';
import { RateLimitGuard } from '../../../common/rate-limit.guard';

@Injectable()
export class DashboardReportMessageController {
  constructor(private readonly reportsService: DashboardReportService) {}

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_OVERVIEW)
  async getOverview(
    @Payload() payload: { headers: { authorization: string } },
  ) {
    const token = payload.headers.authorization;
    return this.reportsService.getOverview(token);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE)
  async getShipmentPerformance(
    @Payload() payload: { headers: { authorization: string } },
  ) {
    return this.reportsService.getShipmentPerformance();
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_REVENUE_TRENDS)
  async getRevenueTrends(
    @Payload() payload: { headers: { authorization: string }; period: string },
  ) {
    const period = payload.period?.toLowerCase() as
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly';
    return this.reportsService.getRevenueTrends(period);
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE)
  async getBranchPerformance(
    @Payload() payload: { headers: { authorization: string }; metric: string },
  ) {
    const metric = payload.metric?.toLowerCase() || 'deliveries';
    return this.reportsService.getBranchPerformance(metric);
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_DRIVER_PERFORMANCE)
  async getDriverPerformance(
    @Payload()
    payload: {
      headers: { authorization: string };
      regionId: string;
    },
  ) {
    const regionId = payload.regionId;
    return this.reportsService.getDriverPerformance(regionId);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_BRANCH_SUMMARY)
  async getBranchDashboardSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    return this.reportsService.getBranchDashboardSummary();
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_STAFF_SUMMARY)
  async getStaffDashboardSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    return this.reportsService.getStaffDashboardSummary();
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_ORDER_SUMMARY)
  async getOrderDashboardSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    return this.reportsService.getOrderDashboardSummary();
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_CUSTOMER_SUMMARY)
  async getCustomerDashboardSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    return this.reportsService.getCustomerAnalytics();
  }
    @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_REVENUE_SUMMARY)
  async getReportOverview(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    return this.reportsService.getReportOverview();
  }
}
