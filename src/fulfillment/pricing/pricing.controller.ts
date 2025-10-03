import { Public } from '../../common/decorator/public.decorator';
import { PricingUseCasesImpl } from './pricing.usecase.impl';
import { PATTERNS } from '../../contracts';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  MiscellaneousFeeDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
} from './pricing.entity';
import { Injectable } from '@nestjs/common';
import { IResponse } from '../../common/types';

@Injectable()
export class PricingMessageController {
  constructor(private readonly usecases: PricingUseCasesImpl) {}
  //=============================================================================TARIFF====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_TARIFF_CREATE)
  async createTariff(@Payload() payload: TariffDto) {
    console.log('Tariff datajjj : ', payload);
    const result = await this.usecases.createTariff(payload);
    return IResponse.success('Tariff created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_TARIFF_UPDATE)
  async updateTariff(@Payload() payload: any) {
    console.log('Tariff data : ', payload);
    const result = await this.usecases.updateTariff(payload.id, payload.data);
    return IResponse.success('Tariff updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_TARIFF_FIND_ALL)
  async getTariff() {
    const result = await this.usecases.findAllTariff();
    return IResponse.success('All Tariff fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_TARIFF_FIND_BY_ID)
  async getTariffById(@Payload() id: string) {
    const result = await this.usecases.findTariffById(id);
    return IResponse.success(
      `Tariff with id: ${id} fetched successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_TARIFF_DELETE)
  async deleteTariff(@Payload() id: string) {
    const result = await this.usecases.deleteTariff(id);
    return IResponse.success(
      `Tariff with id: ${id} deleted successfully`,
      result,
    );
  }
  //===================================================================================================PROFIT MARGIN====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_CREATE)
  async createProfitMargin(@Payload() data: ProfitMarginDto) {
    const result = await this.usecases.createProfitMargin(data);
    return IResponse.success('Profit margin created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL)
  async getProfitMargin() {
    const result = await this.usecases.findAllProfitMargins();
    return IResponse.success('All Profit margin fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_UPDATE)
  async updateProfitMargin(@Payload() data: any) {
    const result = await this.usecases.updateProfitMargin(data.id, data.data);
    return IResponse.success('Profit margin updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID)
  async getProfitMarginById(@Payload() id: string) {
    const result = await this.usecases.findProfitMarginById(id);
    return IResponse.success(
      `Profit margin with id: ${id} fetched successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_PROFIT_MARGIN_DELETE)
  async deleteProfitMargin(@Payload() id: string) {
    const result = await this.usecases.deleteProfitMargin(id);
    return IResponse.success(
      `Profit margin with id: ${id} deleted successfully`,
      result,
    );
  }
  //===================================================================================================AIRPORT FEE====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_CREATE)
  async createAirportFee(@Payload() data: AirportFeeDto) {
    const result = await this.usecases.createAirportFee(data);
    return IResponse.success('Airport fee created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL)
  async getAirportFee() {
    const result = await this.usecases.findAllAirportFees();
    return IResponse.success('All Airport fee fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_UPDATE)
  async updateAirportFee(@Payload() data: any) {
    const result = await this.usecases.updateAirportFee(data.id, data.data);
    return IResponse.success('Airport fee updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID)
  async getAirportFeeById(@Payload() id: string) {
    const result = await this.usecases.findAirportFeeById(id);
    return IResponse.success(
      `Airport fee with id: ${id} fetched successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_AIRPORT_FEE_DELETE)
  async deleteAirportFee(@Payload() id: string) {
    const result = await this.usecases.deleteAirportFee(id);
    return IResponse.success(
      `Airport fee with id: ${id} deleted successfully`,
      result,
    );
  }
  //=============================================================================================MISCELLANEOUS FEE====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_CREATE)
  async createMiscFee(@Payload() data: MiscellaneousFeeDto) {
    const result = await this.usecases.createMiscFee(data);
    return IResponse.success('Miscellaneous fee created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_FIND_ALL)
  async getMiscFee() {
    const result = await this.usecases.findAllMiscFees();
    return IResponse.success(
      'All Miscellaneous fee fetched successfully',
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_UPDATE)
  async updateMiscFee(@Payload() data: any) {
    const result = await this.usecases.updateMiscFee(data.id, data.data);
    return IResponse.success('Miscellaneous fee updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_FIND_BY_ID)
  async getMiscFeeById(@Payload() id: string) {
    const result = await this.usecases.findMiscFeeById(id);
    return IResponse.success(
      `Miscellaneous fee with id: ${id} fetched successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_MISC_FEE_DELETE)
  async deleteMiscFee(@Payload() id: string) {
    const result = await this.usecases.deleteMiscFee(id);
    return IResponse.success(
      `Miscellaneous fee with id: ${id} deleted successfully`,
      result,
    );
  }
  //==============================================================================SURCHARGE====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_CREATE)
  async createSurcharge(@Payload() data: SurchargeDto) {
    console.log('Surcharge data : ', data);
    const result = await this.usecases.createSurcharge(data);
    return IResponse.success('Surcharge created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_FIND_ALL)
  async getSurcharge() {
    const result = await this.usecases.findAllSurcharge();
    return IResponse.success('All Surcharge fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_UPDATE)
  async updateSurcharge(@Payload() data: any) {
    console.log('Surcharge data : ', data);
    const result = await this.usecases.updateSurcharge(data.id, data.data);
    return IResponse.success('Surcharge updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_DELETE)
  async deleteSurcharge(@Payload() id: string) {
    const result = await this.usecases.deleteSurcharge(id);
    return IResponse.success(
      `Surcharge with id: ${id} deleted successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_SURCHARGE_FIND_BY_ID)
  async getSurchargeById(@Payload() id: string) {
    const result = await this.usecases.findSurchargeById(id);
    return IResponse.success(
      `Surcharge with id: ${id} fetched successfully`,
      result,
    );
  }
  //==============================================================================DISCOUNT====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_CREATE)
  async createDiscount(@Payload() data: DiscountDto) {
    console.log('Discount data : ', data);

    const result = await this.usecases.createDiscount(data);
    return IResponse.success('Discount created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_FIND_ALL)
  async getDiscount() {
    const result = await this.usecases.findAllDiscount();
    return IResponse.success('All Discount fetched successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_UPDATE)
  async updateDiscount(@Payload() data: any) {
    console.log('Discount data : ', data);
    const result = await this.usecases.updateDiscount(data.id, data.data);
    return IResponse.success('Discount updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_DELETE)
  async deleteDiscount(@Payload() id: string) {
    const result = await this.usecases.deleteDiscount(id);
    return IResponse.success(
      `Discount with id: ${id} deleted successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_DISCOUNT_FIND_BY_ID)
  async getDiscountById(@Payload() id: string) {
    const result = await this.usecases.findDiscountById(id);
    return IResponse.success(
      `Discount with id: ${id} fetched successfully`,
      result,
    );
  }
  //==============================================================================CUSTOMER CATEGORY====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE)
  async createCustomerCategory(@Payload() data: CustomerCategoryDto) {
    const result = await this.usecases.createCustomerCategory(data);
    return IResponse.success('Customer category created successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL)
  async getCustomerCategory() {
    const result = await this.usecases.findAllCustomerCategory();
    return IResponse.success(
      'All Customer category fetched successfully',
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE)
  async updateCustomerCategory(@Payload() data: any) {
    const result = await this.usecases.updateCustomerCategory(
      data.id,
      data.data,
    );
    return IResponse.success('Customer category updated successfully', result);
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE)
  async deleteCustomerCategory(@Payload() id: string) {
    const result = await this.usecases.deleteCustomerCategory(id);
    return IResponse.success(
      `Customer category with id: ${id} deleted successfully`,
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID)
  async getCustomerCategoryById(@Payload() id: string) {
    const result = await this.usecases.findCustomerCategoryById(id);
    return IResponse.success(
      `Customer category with id: ${id} fetched successfully`,
      result,
    );
  }
  //==============================================================================PRICE CALCULATION LOG====================================================================
  @Public()
  @MessagePattern(PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL)
  async getPriceCalculationLog() {
    const result = await this.usecases.findAllPriceCalculationLog();
    return IResponse.success(
      'All Price calculation log fetched successfully',
      result,
    );
  }

  @Public()
  @MessagePattern(PATTERNS.PRICE_CALCULATE)
  async calculatePrice(@Payload() data: any) {
    console.log('data calculate price : ', data);

    const { orderId, customerId } = data;
    const result = await this.usecases.calculatePrice(orderId, customerId);
    return IResponse.success('Price calculated successfully', result);
  }
}
