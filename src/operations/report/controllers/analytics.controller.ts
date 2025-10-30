import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServiceType } from '@prisma/client';
import { CheckPermission } from '../../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../../common/permission.guard';
import { PATTERNS } from '../../../contracts';
import { PermissionActions } from '../../../contracts/permission-actions.enum';
import { RateLimitGuard } from '../../../common/rate-limit.guard';

@Controller('analytics')
export class AnalyticsController {
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Analytics-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_SHIPMENT_SUMMARY)
  async getShipmentSummary(
    @Payload() payload: { headers: { authorization: string } },
  ) {}
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Analytics-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_SHIPMENT_STATUS_BREAKDOWN)
  async getShipmentStatusBreakdown(
    @Payload() payload: { headers: { authorization: string } },
  ) {}
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Analytics-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_SHIPMENT_BY_TYPE)
  async getShipmentByType(
    @Payload()
    payload: {
      headers: { authorization: string };
      serviceType: ServiceType;
    },
  ) {}
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Analytics-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_SHIPMENT_BY_CUSTOMER)
  async getShipmentByCustomer(
    @Payload()
    payload: {
      customerId: string;
      headers: { authorization: string };
    },
  ) {}
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Analytics-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_SHIPMENT_DELAYED)
  async getDelayedShipments(
    @Payload() payload: { headers: { authorization: string } },
  ) {}
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_BRANCH_OVERVIEW)
  async getBranchOverview(
    @Payload() payload: { headers: { authorization: string } },
  ) {}
}
