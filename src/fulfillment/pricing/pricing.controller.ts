import { PricingUseCasesImpl } from './pricing.usecase.impl';
import { PATTERNS } from '../../contracts';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AddCommissionDto,
  CustomerCategoryDto,
  PriceCalculationLogDto,
  TariffDto,
  updateCommissionDto,
  UpdateCustomerCategoryDto,
  UpdateTariffDto,
} from './pricing.entity';
import { Controller, UseGuards } from '@nestjs/common';
import { IResponse } from '../../common/types';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import { PermissionActions } from '../../contracts/permission-actions.enum';
import { ListQueryDto } from '../../common/query/query.dto';
import { RateLimitGuard } from '../../common/rate-limit.guard';
import { CreateOrderDto } from '../order/order.entity';
import { Public } from '../../common/decorator/public.decorator';

@Controller()
export class PricingMessageController {
  constructor(private readonly usecases: PricingUseCasesImpl) {}
  //=============================================================================TARIFF====================================================================
  
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_TARIFF_CREATE)
  async createTariff(@Payload() payload: { data: TariffDto; user: any }) {
    console.log('Tariff datajjj : ', payload);
    const userId = payload.user?.sub;
    const result = await this.usecases.createTariff(payload.data, userId);
    return IResponse.success('Tariff created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_TARIFF_UPDATE)
  async updateTariff(
    @Payload() payload: { id: string; data: UpdateTariffDto; user: any },
  ) {
    const userId = payload.user?.sub;
    console.log('Tariff data : ', payload);
    const result = await this.usecases.updateTariff(
      payload.id,
      payload.data,
      userId,
    );
    return IResponse.success('Tariff updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_TARIFF_FIND_ALL)
  async getTariff(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllTariff(payload.query);
    return IResponse.success('All Tariff fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_TARIFF_FIND_BY_ID)
  async getTariffById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findTariffById(payload.id);
    return IResponse.success(
      `Tariff with id: ${payload.id} fetched successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_TARIFF_DELETE)
  async deleteTariff(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteTariff(payload.id);
    return IResponse.success(
      `Tariff with id: ${payload.id} deleted successfully`,
      result,
    );
  }

  //==============================================================================CUSTOMER CATEGORY====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Customer.Category', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE)
  async createCustomerCategory(
    @Payload() payload: { data: CustomerCategoryDto },
  ) {
    const result = await this.usecases.createCustomerCategory(payload.data);
    return IResponse.success('Customer category created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Customer.Category', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL)
  async getCustomerCategory(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllCustomerCategory(payload.query);
    return IResponse.success(
      'All Customer category fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Customer.Category', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE)
  async updateCustomerCategory(
    @Payload() payload: { id: string; data: UpdateCustomerCategoryDto },
  ) {
    const result = await this.usecases.updateCustomerCategory(
      payload.id,
      payload.data,
    );
    return IResponse.success('Customer category updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Customer.Category', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE)
  async deleteCustomerCategory(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteCustomerCategory(payload.id);
    return IResponse.success(
      `Customer category with id: ${payload.id} deleted successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Customer.Category', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID)
  async getCustomerCategoryById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findCustomerCategoryById(payload.id);
    return IResponse.success(
      `Customer category with id: ${payload.id} fetched successfully`,
      result,
    );
  }
  //==============================================================================PRICE CALCULATION LOG====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL)
  async getPriceCalculationLog(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllPriceCalculationLog(
      payload.query,
    );
    return IResponse.success(
      'All Price calculation log fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('CalculatePrice', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_CALCULATE)
  async calculatePrice(@Payload() payload: { data: PriceCalculationLogDto }) {

    const { orderId, customerId } = payload.data;
    const result = await this.usecases.calculatePrice(orderId);
    return IResponse.success('Price calculated successfully', result);
  }

  //==============================================================================DRIVER COMMISSION====================================================================

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_CREATE_VEHICLE_COMMISSION)
  async addCommission(
    @Payload() payload: { data: AddCommissionDto; user: any },
  ) {
    const userId = payload.user.sub;

    const result = await this.usecases.addCommission(payload.data, userId);
    return IResponse.success('Vehicle Commission Added successfully.', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_UPDATE_VEHICLE_COMMISSION)
  async updateCommission(
    @Payload() payload: { data: updateCommissionDto; id: string; user: any },
  ) {
    const userId = payload.user.sub;
    const result = await this.usecases.updateCommission(
      payload.data,
      payload.id,
      userId,
    );
    return IResponse.success('Vehicle Commission updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_FIND_ALL_VEHICLE_COMMISSION)
  async getCommission(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllCommissions(payload.query);
    return IResponse.success(
      'All Vehicle commissions fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_DELETE_VEHICLE_COMMISSION)
  async deleteCommission(@Payload() payload: { id: string; user: any }) {
    const userId = payload.user.sub;
    const result = await this.usecases.deleteCommission(payload.id, userId);
    return IResponse.success(
      `Vehicle commission deleted successfully for id ${payload.id}`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_FIND_VEHICLE_COMMISSION_BY_ID)
  async getCommissionById(@Payload() payload: { id: string; user: any }) {
    const userId = payload.user.sub;
    const result = await this.usecases.findCommissionById(payload.id);
    return IResponse.success(
      `Vehicle commission fetched successfully for id ${payload.id}`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('VehicleCommission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_GET_DRIVER_EARNINGS)
  async getDriverEarnings(@Payload() payload: { user: any }) {
    const userId = payload.user.sub;
    const result = await this.usecases.getDriverEarnings(userId);
    return IResponse.success(
      `Driver Earnings fetched successfully for id ${userId}`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_GET_ORDER_PRICE_SUMMARY)
  async getOrderSummaryPrice(@Payload() payload: { data: CreateOrderDto }) {
    const result = await this.usecases.calculatePriceFromDtoV2(payload.data);
    return IResponse.success(`Order summary fetched successfully `, result);
  }
}
