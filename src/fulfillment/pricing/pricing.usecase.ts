import { ListQueryDto } from '../../common/query/query.dto';
import {
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
  UpdateAirportFeeDto,
  UpdateCustomerCategoryDto,
  UpdateDiscountDto,
  UpdateProfitMarginDto,
  UpdateSurchargeDto,
  UpdateTariffDto,
} from './pricing.entity';

export interface PricingUseCases {
  //=====================================================TARIFF================================================================
  createTariff(data: TariffDto, userId: string): Promise<any>;
  findAllTariff(query: ListQueryDto): Promise<any>;
  findTariffById(id: string): Promise<any>;
  updateTariff(id: string, data: UpdateTariffDto, userId: string): Promise<any>;
  deleteTariff(id: string): Promise<any>;
  //======================================================================PROFIT MARGIN================================================================
  // createProfitMargin(data: ProfitMarginDto): Promise<any>;
  // findAllProfitMargins(query: ListQueryDto): Promise<any>;
  // findProfitMarginById(id: string): Promise<any>;
  // updateProfitMargin(id: string, data: UpdateProfitMarginDto): Promise<any>;
  // deleteProfitMargin(id: string): Promise<any>;
  // //========================================================================AIRPORT FEES================================================================
  // createAirportFee(data: AirportFeeDto): Promise<any>;
  // findAllAirportFees(query: ListQueryDto): Promise<any>;
  // findAirportFeeById(id: string): Promise<any>;
  // updateAirportFee(
  //   id: string,
  //   data: Partial<UpdateAirportFeeDto>,
  // ): Promise<any>;
  // deleteAirportFee(id: string): Promise<any>;
  // //==========================================================================MISCELLANEOUS FEES================================================================
  // createMiscFee(data: any): Promise<any>;
  // findAllMiscFees(query: ListQueryDto): Promise<any>;
  // findMiscFeeById(id: string): Promise<any>;
  // updateMiscFee(id: string, data: any): Promise<any>;
  // deleteMiscFee(id: string): Promise<any>;
  // //============================================================SURCHARGE================================================================
  // createSurcharge(data: SurchargeDto): Promise<any>;
  // findAllSurcharge(query: ListQueryDto): Promise<any>;
  // findSurchargeById(id: string): Promise<any>;
  // updateSurcharge(id: string, data: Partial<UpdateSurchargeDto>): Promise<any>;
  // deleteSurcharge(id: string): Promise<any>;
  // //============================================================DISCOUNT================================================================
  // createDiscount(data: DiscountDto): Promise<any>;
  // findAllDiscount(query: ListQueryDto): Promise<any>;
  // findDiscountById(id: string): Promise<any>;
  // updateDiscount(id: string, data: Partial<UpdateDiscountDto>): Promise<any>;
  // deleteDiscount(id: string): Promise<any>;
  //=============================================================CUSTOMER CATEGORY================================================================
  createCustomerCategory(data: CustomerCategoryDto): Promise<any>;
  findAllCustomerCategory(query: ListQueryDto): Promise<any>;
  findCustomerCategoryById(id: string): Promise<any>;
  updateCustomerCategory(
    id: string,
    data: UpdateCustomerCategoryDto,
  ): Promise<any>;
  deleteCustomerCategory(id: string): Promise<any>;
  //====================================================================PRICING CALCULATION LOG================================================================
  createPriceCalculationLog(data: any): Promise<any>;
  findAllPriceCalculationLog(query: ListQueryDto): Promise<any>;
  findPriceCalculationLogById(id: string): Promise<any>;
  deletePriceCalculationLog(id: string): Promise<any>;
  // calculatePrice(orderId: string, customerId: string): Promise<any>;
}
