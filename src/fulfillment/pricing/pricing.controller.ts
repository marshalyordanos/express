import { PricingUseCasesImpl } from './pricing.usecase.impl';
import { PATTERNS } from '../../contracts';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AddDriverCommissionDto,
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  MiscellaneousFeeDto,
  PriceCalculationLogDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
  UpdateAirportFeeDto,
  UpdateCustomerCategoryDto,
  UpdateDiscountDto,
  UpdateMiscellaneousFeeDto,
  UpdateProfitMarginDto,
  UpdateSurchargeDto,
  UpdateTariffDto,
} from './pricing.entity';
import { Controller, UseGuards } from '@nestjs/common';
import { IResponse } from '../../common/types';
import { CheckPermission } from '../../common/decorator/check-permission.decorator';
import { PermissionGuard } from '../../common/permission.guard';
import {
  PermissionActions,
  ScopeAction,
} from '../../contracts/permission-actions.enum';
import { ListQueryDto } from '../../common/query/query.dto';
import { RateLimitGuard } from '../../common/rate-limit.guard';

@Controller()
export class PricingMessageController {
  constructor(private readonly usecases: PricingUseCasesImpl) {}
  //=============================================================================TARIFF====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_TARIFF_CREATE)
  async createTariff(@Payload() payload: { data: TariffDto }) {
    console.log('Tariff datajjj : ', payload);
    const result = await this.usecases.createTariff(payload.data);
    return IResponse.success('Tariff created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_TARIFF_UPDATE)
  async updateTariff(
    @Payload() payload: { id: string; data: UpdateTariffDto },
  ) {
    console.log('Tariff data : ', payload);
    const result = await this.usecases.updateTariff(payload.id, payload.data);
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
  //===================================================================================================PROFIT MARGIN====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_CREATE)
  async createProfitMargin(@Payload() payload: { data: ProfitMarginDto }) {
    const result = await this.usecases.createProfitMargin(payload.data);
    return IResponse.success('Profit margin created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL)
  async getProfitMargin(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllProfitMargins(payload.query);
    return IResponse.success('All Profit margin fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_UPDATE)
  async updateProfitMargin(
    @Payload() payload: { id: string; data: UpdateProfitMarginDto },
  ) {
    const result = await this.usecases.updateProfitMargin(
      payload.id,
      payload.data,
    );
    return IResponse.success('Profit margin updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID)
  async getProfitMarginById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findProfitMarginById(payload.id);
    return IResponse.success(
      `Profit margin with id: ${payload.id} fetched successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_DELETE)
  async deleteProfitMargin(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteProfitMargin(payload.id);
    return IResponse.success(
      `Profit margin with id: ${payload.id} deleted successfully`,
      result,
    );
  }
  //===================================================================================================AIRPORT FEE====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_CREATE)
  async createAirportFee(@Payload() payload: { data: AirportFeeDto }) {
    const result = await this.usecases.createAirportFee(payload.data);
    return IResponse.success('Airport fee created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL)
  async getAirportFee(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllAirportFees(payload.query);
    return IResponse.success('All Airport fee fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_UPDATE)
  async updateAirportFee(
    @Payload() payload: { id: string; data: UpdateAirportFeeDto },
  ) {
    const result = await this.usecases.updateAirportFee(
      payload.id,
      payload.data,
    );
    return IResponse.success('Airport fee updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID)
  async getAirportFeeById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findAirportFeeById(payload.id);
    return IResponse.success(
      `Airport fee with id: ${payload.id} fetched successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_DELETE)
  async deleteAirportFee(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteAirportFee(payload.id);
    return IResponse.success(
      `Airport fee with id: ${payload.id} deleted successfully`,
      result,
    );
  }
  //=============================================================================================MISCELLANEOUS FEE====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_CREATE)
  async createMiscFee(@Payload() payload: { data: MiscellaneousFeeDto }) {
    const result = await this.usecases.createMiscFee(payload.data);
    return IResponse.success('Miscellaneous fee created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_FIND_ALL)
  async getMiscFee(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllMiscFees(payload.query);
    return IResponse.success(
      'All Miscellaneous fee fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_UPDATE)
  async updateMiscFee(
    @Payload() payload: { id: string; data: UpdateMiscellaneousFeeDto },
  ) {
    const result = await this.usecases.updateMiscFee(payload.id, payload.data);
    return IResponse.success('Miscellaneous fee updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_FIND_BY_ID)
  async getMiscFeeById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findMiscFeeById(payload.id);
    return IResponse.success(
      `Miscellaneous fee with id: ${payload.id} fetched successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_DELETE)
  async deleteMiscFee(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteMiscFee(payload.id);
    return IResponse.success(
      `Miscellaneous fee with id: ${payload.id} deleted successfully`,
      result,
    );
  }
  //==============================================================================SURCHARGE====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_CREATE)
  async createSurcharge(@Payload() payload: { data: SurchargeDto }) {
    console.log('Surcharge data : ', payload.data);
    const result = await this.usecases.createSurcharge(payload.data);
    return IResponse.success('Surcharge created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_FIND_ALL)
  async getSurcharge(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllSurcharge(payload.query);
    return IResponse.success('All Surcharge fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_UPDATE)
  async updateSurcharge(
    @Payload() payload: { id: string; data: UpdateSurchargeDto },
  ) {
    console.log('Surcharge data : ', payload);
    const result = await this.usecases.updateSurcharge(
      payload.id,
      payload.data,
    );
    return IResponse.success('Surcharge updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_DELETE)
  async deleteSurcharge(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteSurcharge(payload.id);
    return IResponse.success(
      `Surcharge with id: ${payload.id} deleted successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_FIND_BY_ID)
  async getSurchargeById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findSurchargeById(payload.id);
    return IResponse.success(
      `Surcharge with id: ${payload.id} fetched successfully`,
      result,
    );
  }
  //==============================================================================DISCOUNT====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_CREATE)
  async createDiscount(@Payload() payload: { data: DiscountDto }) {
    console.log('Discount data : ', payload.data);

    const result = await this.usecases.createDiscount(payload.data);
    return IResponse.success('Discount created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_FIND_ALL)
  async getDiscount(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllDiscount(payload.query);
    return IResponse.success('All Discount fetched successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_UPDATE)
  async updateDiscount(
    @Payload() payload: { id: string; data: UpdateDiscountDto },
  ) {
    console.log('Discount data : ', payload);
    const result = await this.usecases.updateDiscount(payload.id, payload.data);
    return IResponse.success('Discount updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_DELETE)
  async deleteDiscount(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteDiscount(payload.id);
    return IResponse.success(
      `Discount with id: ${payload.id} deleted successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_FIND_BY_ID)
  async getDiscountById(@Payload() payload: { id: string }) {
    const result = await this.usecases.findDiscountById(payload.id);
    return IResponse.success(
      `Discount with id: ${payload.id} fetched successfully`,
      result,
    );
  }
  //==============================================================================CUSTOMER CATEGORY====================================================================
  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE)
  async createCustomerCategory(
    @Payload() payload: { data: CustomerCategoryDto },
  ) {
    const result = await this.usecases.createCustomerCategory(payload.data);
    return IResponse.success('Customer category created successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL)
  async getCustomerCategory(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllCustomerCategory(payload.query);
    return IResponse.success(
      'All Customer category fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.UPDATE)
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
  @CheckPermission('Price', PermissionActions.DELETE)
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE)
  async deleteCustomerCategory(@Payload() payload: { id: string }) {
    const result = await this.usecases.deleteCustomerCategory(payload.id);
    return IResponse.success(
      `Customer category with id: ${payload.id} deleted successfully`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('Price', PermissionActions.READ)
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
    console.log('data calculate price : ', payload.data);

    const { orderId, customerId } = payload.data;
    const result = await this.usecases.calculatePrice(orderId, customerId);
    return IResponse.success('Price calculated successfully', result);
  }

  //==============================================================================DRIVER COMMISSION====================================================================

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('DriverCommission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_CREATE_DRIVER_COMMISSION)
  async addDriverCommission(
    @Payload() payload: { data: AddDriverCommissionDto; user: any },
  ) {
    const userId = payload.user.sub;
    console.log("User :: ", payload.user);
    console.log("User Id ::: ", userId);
    
    const result = await this.usecases.addDriverCommission(
      payload.data,
      userId,
    );
    return IResponse.success('Driver Commission Added successfully.', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('DriverCommission', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_UPDATE_DRIVER_COMMISSION)
  async updateDriverCommission(
    @Payload() payload: { data: AddDriverCommissionDto; id: string; user: any },
  ) {
    const userId = payload.user.sub;
    const result = await this.usecases.updateDriverCommission(
      payload.data,
      payload.id,
      userId,
    );
    return IResponse.success('Driver Commission updated successfully', result);
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('DriverCommission', PermissionActions.READ)
  @MessagePattern(PATTERNS.PRICE_FIND_ALL_DRIVER_COMMISSION)
  async getDriverCommission(@Payload() payload: { query: ListQueryDto }) {
    const result = await this.usecases.findAllDriverCommissions(payload.query);
    return IResponse.success(
      'All Driver commissions fetched successfully',
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('DriverCommission', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_DELETE_DRIVER_COMMISSION)
  async deleteDriverCommission(@Payload() payload: { id: string; user: any }) {
    const userId = payload.user.sub;
    const result = await this.usecases.deleteDriverCommission(
      payload.id,
      userId,
    );
    return IResponse.success(
      `Driver commission deleted successfully for id ${payload.id}`,
      result,
    );
  }

  @UseGuards(PermissionGuard, RateLimitGuard)
  @CheckPermission('DriverCommission', PermissionActions.CREATE)
  @MessagePattern(PATTERNS.PRICE_FIND_DRIVER_COMMISSION_BY_ID)
  async getDriverCommissionById(@Payload() payload: { id: string; user: any }) {
    const userId = payload.user.sub;
    const result = await this.usecases.findDriverCommissionById(payload.id);
    return IResponse.success(
      `Driver commission fetched successfully for id ${payload.id}`,
      result,
    );
  }
}
