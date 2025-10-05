import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
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
} from '../fulfillment/pricing/pricing.entity';
import { ListQueryDto } from '../common/query/query.dto';

@Controller('pricing')
export class PricingGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly pricingClient: ClientProxy,
  ) {}
  //==========================================================================TARIFF==================================================================================
  @Post('tariff')
  async createTariff(@Body() data: TariffDto, @Req() req) {
    console.log('Tariff data : ', data);
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('tariff')
  async getTariff(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('tariff/:id')
  async updateTariff(
    @Param('id') id: string,
    @Body() data: UpdateTariffDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('tariff/:id')
  async getTariffById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('tariff/:id')
  async deleteTariff(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //====================================================================================================================PROFIT MARGIN===============================================================================
  @Post('profit-margin')
  async createProfitMargin(@Body() data: ProfitMarginDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Patch('profit-margin/:id')
  async updateProfitMargin(
    @Param('id') id: string,
    @Body() data: UpdateProfitMarginDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('profit-margin')
  async getProfitMargin(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('profit-margin/:id')
  async getProfitMarginById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('profit-margin/:id')
  async deleteProfitMargin(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //============================================================================================================================AIRPORT FEES===============================================================================
  @Post('airport-fee')
  async createAirportFee(@Body() data: AirportFeeDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('airport-fee')
  async getAirportFee(@Req() req, @Query() query: ListQueryDto) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL, {
      headers: { authorization: req.headers['authorization'] || null },
      query,
    });
  }

  @Patch('airport-fee/:id')
  async updateAirportFee(
    @Param('id') id: string,
    @Body() data: UpdateAirportFeeDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
      /*************  ✨ Windsurf Command ⭐  *************/
      /**
       * Deletes a miscellaneous fee with the given id
       * @param {string} id - The id of the miscellaneous fee to delete
       * @returns {Promise<any>} - The result of the delete operation
       */
      /*******  6bb29992-2923-45e7-a42f-7df421b392a9  *******/
    });
  }

  @Get('airport-fee/:id')
  async getAirportFeeById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('airport-fee/:id')
  async deleteAirportFee(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //=================================================================================================================MISCELLANEOUS FEES===============================================================================
  @Post('misc-fee')
  async createMiscFee(@Body() data: MiscellaneousFeeDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('misc-fee')
  async getMiscFee(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('misc-fee/:id')
  async updateMiscFee(
    @Param('id') id: string,
    @Body() data: UpdateMiscellaneousFeeDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('misc-fee/:id')
  async getMiscFeeById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('misc-fee/:id')
  async deleteMiscFee(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //==========================================================================================================SURCHARGE==================================================================================
  @Post('surcharge')
  async createSurcharge(@Body() data: SurchargeDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('surcharge')
  async getSurcharge(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('surcharge/:id')
  async updateSurcharge(
    @Param('id') id: string,
    @Body() data: UpdateSurchargeDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('surcharge/:id')
  async getSurchargeById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('surcharge/:id')
  async deleteSurcharge(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //==========================================================================================================DISCOUNT==================================================================================
  @Post('discount')
  async createDiscount(@Body() data: DiscountDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('discount')
  async getDiscount(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('discount/:id')
  async updateDiscount(
    @Param('id') id: string,
    @Body() data: UpdateDiscountDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('discount/:id')
  async getDiscountById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Delete('discount/:id')
  async deleteDiscount(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //====================================================================================================================CUSTOMER CATEGORY===============================================================================
  @Post('customer-category')
  async createCustomerCategory(@Body() data: CustomerCategoryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE, {
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('customer-category')
  async getCustomerCategory(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Patch('customer-category/:id')
  async updateCustomerCategory(
    @Param('id') id: string,
    @Body() data: UpdateCustomerCategoryDto,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
    });
  }

  @Get('customer-category/:id')
  async getCustomerCategoryById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(
      PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID,
      { id, headers: { authorization: authHeader } },
    );
  }

  @Delete('customer-category/:id')
  async deleteCustomerCategory(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE, {
      id,
      headers: { authorization: authHeader },
    });
  }
  //============================================================================================================PRICE CALCULATION AND LOG===============================================================================
  @Get('price-calculation-log')
  async getPriceCalculationLog(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL, {
      headers: { authorization: authHeader },
      query,
    });
  }

  @Get('price-calculation-log/:id')
  async getPriceCalculationLogById(@Param('id') id: string, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CALCULATION_LOG_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
    });
  }

  @Post('calculate')
  async calculatePrice(@Body() data: PriceCalculationLogDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CALCULATE, {
      data,
      headers: { authorization: authHeader },
    });
  }
}
