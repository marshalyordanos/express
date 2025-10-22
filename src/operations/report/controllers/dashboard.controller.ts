import { Controller, Get, Injectable, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServiceType } from '@prisma/client';
import { CheckPermission } from '../../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../../common/permission.guard';
import { PATTERNS } from '../../../contracts';
import { PermissionActions } from '../../../contracts/permission-actions.enum';
import { DashboardReportService } from '../services/dashboard.service';

@Injectable()
export class DashboardReportMessageController {
  constructor(private readonly reportsService: DashboardReportService) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_OVERVIEW)
  async getOverview(
    @Payload() payload: { headers: { authorization: string } },
  ) {
    const token = payload.headers.authorization;
    return this.reportsService.getOverview(token);
  }

  @UseGuards(PermissionGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE)
  async getShipmentPerformance(
    @Payload() payload: { headers: { authorization: string } },
  ) {
    return this.reportsService.getShipmentPerformance();
  }
  @UseGuards(PermissionGuard)
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
  @UseGuards(PermissionGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE)
  async getBranchPerformance(
    @Payload() payload: { headers: { authorization: string }; metric: string },
  ) {
    const metric = payload.metric?.toLowerCase() || 'deliveries';
    return this.reportsService.getBranchPerformance(metric);
  }
  @UseGuards(PermissionGuard)
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
    return this.reportsService.getDriverPerformance();
  }
}
