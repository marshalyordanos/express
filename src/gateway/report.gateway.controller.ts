import { Controller, Get, Inject, Param, Query, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ServiceType } from '@prisma/client';
import { PATTERNS } from '../contracts';

@Controller('report')
export class ReportGatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly reportClient: ClientProxy,
  ) {}

  @Get('dashboard/overview')
  async getOverview(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_OVERVIEW, {
      headers: { authorization: authHeader },
    });
  }

  @Get('dashboard/shipment-performance')
  async getShipmentPerformance(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(
      PATTERNS.REPORT_DASHBOARD_SHIPMENT_PERFORMANCE,
      {
        headers: { authorization: authHeader },
      },
    );
  }

  @Get('dashboard/revenue-trends')
  async getRevenueTrends(@Query('period') period: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_REVENUE_TRENDS, {
      period,
      headers: { authorization: authHeader },
    });
  }

  @Get('dashboard/branch-performance')
  async getBranchPerformance(@Query('metric') metric: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(
      PATTERNS.REPORT_DASHBOARD_BRANCH_PERFORMANCE,
      {
        metric,
        headers: { authorization: authHeader },
      },
    );
  }

  @Get('dashboard/driver-performance')
  async getDriverPerformance(@Query('region') regionId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(
      PATTERNS.REPORT_DASHBOARD_DRIVER_PERFORMANCE,
      {
        regionId,
        headers: { authorization: authHeader },
      },
    );
  }

  @Get('dashboard/branch-summary')
  async getBranchDashboardSummary(
    @Query('region') regionId: string,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_BRANCH_SUMMARY, {
      regionId,
      headers: { authorization: authHeader },
    });
  }
  @Get('dashboard/staff-summary')
  async getStaffDashboardSummary(
    @Query('region') regionId: string,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_STAFF_SUMMARY, {
      regionId,
      headers: { authorization: authHeader },
    });
  }
  @Get('dashboard/order-summary')
  async getOrderDashboardSummary(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_ORDER_SUMMARY, {
      headers: { authorization: authHeader },
    });
  }
  @Get('dashboard/customer-summary')
  async getCustomerDashboardSummary(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_DASHBOARD_CUSTOMER_SUMMARY, {
      headers: { authorization: authHeader },
    });
  }

  @Get('shipment/summary')
  async getShipmentSummary(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_SHIPMENT_SUMMARY, {
      headers: { authorization: authHeader },
    });
  }

  @Get('shipment/status')
  async getShipmentStatusBreakdown(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_SHIPMENT_STATUS_BREAKDOWN, {
      headers: { authorization: authHeader },
    });
  }

  @Get('shipment/by-type')
  async getShipmentByType(
    @Query('serviceType') serviceType: ServiceType,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_SHIPMENT_BY_TYPE, {
      serviceType,
      headers: { authorization: authHeader },
    });
  }

  @Get('shipment/by-customer/:customerId')
  async getShipmentByCustomer(
    @Param('customerId') customerId: string,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_SHIPMENT_BY_CUSTOMER, {
      customerId,
      headers: { authorization: authHeader },
    });
  }

  @Get('shipment/delayed')
  async getDelayedShipments(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_SHIPMENT_DELAYED, {
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/branch-overview')
  async getBranchOverview(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_BRANCH_OVERVIEW, {
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/branch/:branchId/details')
  async getBranchDetails(@Param('branchId') branchId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_BRANCH_DETAILS, {
      branchId,
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/driver-overview')
  async getDriverOverview(@Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_DRIVER_OVERVIEW, {
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/driver/:driverId/details')
  async getDriverDetails(@Param('driverId') driverId: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_DRIVER_DETAILS, {
      driverId,
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/top-branches')
  async getTopBranches(@Query('metric') metric: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_TOP_BRANCHES, {
      metric,
      headers: { authorization: authHeader },
    });
  }

  @Get('performance/top-drivers')
  async getTopDrivers(@Query('metric') metric: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;

    return this.reportClient.send(PATTERNS.REPORT_PERFORMANCE_TOP_DRIVERS, {
      metric,
      headers: { authorization: authHeader },
    });
  }
}
