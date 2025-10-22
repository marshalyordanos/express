import { Injectable, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CheckPermission } from "../../../common/decorator/check-permission.decorator";
import { PermissionGuard } from "../../../common/permission.guard";
import { PATTERNS } from "../../../contracts";
import { PermissionActions } from "../../../contracts/permission-actions.enum";


@Injectable()
export class ReportMessageController{
   
  @UseGuards(PermissionGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_BRANCH_DETAILS)
  async getBranchDetails(
    @Payload()
    payload: {
      branchId: string;
      headers: { authorization: string };
    },
  ) {}
  @UseGuards(PermissionGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_DRIVER_OVERVIEW)
  async getDriverOverview(
    @Payload() payload: { headers: { authorization: string } },
  ) {}

  @UseGuards(PermissionGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_DRIVER_DETAILS)
  async getDriverDetails(
    @Payload()
    payload: {
      driverId: string;
      headers: { authorization: string };
    },
  ) {}
  @UseGuards(PermissionGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_TOP_BRANCHES)
  async getTopBranches(
    @Payload() payload: { metric: string; headers: { authorization: string } },
  ) {}
  @UseGuards(PermissionGuard)
  @CheckPermission('Performance-Report', PermissionActions.READ)
  @MessagePattern(PATTERNS.REPORT_PERFORMANCE_TOP_DRIVERS)
  async getTopDrivers(
    @Payload() payload: { metric: string; headers: { authorization: string } },
  ) {}
}