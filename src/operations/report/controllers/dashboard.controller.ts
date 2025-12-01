import { Injectable, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckPermission } from '../../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../../common/permission.guard';
import { PATTERNS } from '../../../contracts';
import { PermissionActions } from '../../../contracts/permission-actions.enum';
import { DashboardReportService } from '../services/dashboard.service';
import { RateLimitGuard } from '../../../common/rate-limit.guard';
import { IResponse } from '../../../common/types';

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
    const result = await this.reportsService.getOverview(token);
    return new IResponse(
      true,
      'Overview Dashboard fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE)
  async getShipmentPerformance(
    @Payload() payload: { headers: { authorization: string } },
  ) {
    const result = await this.reportsService.getShipmentPerformance();
    return new IResponse(
      true,
      'Shipment Performance Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getRevenueTrends(period);
    return new IResponse(
      true,
      'Revenue Trends Dashboard fetches successfully',
      result,
    );
  }
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE)
  async getBranchPerformance(
    @Payload() payload: { headers: { authorization: string }; metric: string },
  ) {
    const metric = payload.metric?.toLowerCase() || 'deliveries';
    const result = await this.reportsService.getBranchPerformance(metric);
    return new IResponse(
      true,
      'Branch Perfromance Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getDriverPerformance(regionId);
    return new IResponse(
      true,
      'Driver Performance Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getBranchDashboardSummary();
    return new IResponse(
      true,
      'Branch Summary Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getStaffDashboardSummary();
    return new IResponse(
      true,
      'Staff Summary Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getOrderDashboardSummary();
    return new IResponse(
      true,
      'Order Summary Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getCustomerAnalytics();
    return new IResponse(
      true,
      'Customer Analytics Summary Dashboard fetches successfully',
      result,
    );
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
    const result = await this.reportsService.getReportOverview();
    return new IResponse(
      true,
      'Revenue Summary Dashboard fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_FLEET_SUMMARY)
  async getFleetSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    const result = await this.reportsService.getFleetSummary();
    return new IResponse(
      true,
      'Fleet Summary Dashboard fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_DISPATCH_SUMMARY)
  async getDispatchSummary(
    @Payload()
    payload: {
      headers: { authorization: string };
    },
  ) {
    const result = await this.reportsService.getDispatchSummary();
    return new IResponse(
      true,
      'Dispatch Summary Dashboard fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_DRIVER)
  async getDriverDashboard(
    @Payload()
    payload: {
      user: any;
    },
  ) {
    const userId = payload.user?.sub;
    const result = await this.reportsService.getDriverDashboard(userId);
    return new IResponse(true, 'Driver Dashboard fetches successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_DRIVER_DELIVERY)
  async getDriverDashboardDelivery(
    @Payload()
    payload: {
      user: any;
    },
  ) {
    const userId = payload.user?.sub;
    const result = await this.reportsService.getDriverDashboardDelivery(userId);
    return new IResponse(
      true,
      'Driver Dashboard Delivery fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_CARGO_OFFICER)
  async getCargoOfficerDashboard(
    @Payload()
    payload: {
      user: any;
    },
  ) {
    const userId = payload.user?.sub;
    const result = await this.reportsService.getCargoOfficerDashboard(userId);
    return new IResponse(
      true,
      'Cargo Officer Dashboard fetches successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Dashboard-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_DASHBOARD_FIND_SORTED_ORDER)
  async getSortedOrders(
    @Payload()
    payload: {
      user: any;
    },
  ) {
    const userId = payload.user?.sub;
    const result = await this.reportsService.getSortedOrder(userId);
    return new IResponse(true, 'Sorted Order fetches successfully', result);
  }
}
