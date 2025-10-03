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
  async createTariff(@Body() data: TariffDto) {
    console.log('Tariff data : ', data);
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_CREATE, data);
  }

  @Get('tariff')
  async getTariff(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Patch('tariff/:id')
  async updateTariff(@Param('id') id: string, @Body() data: UpdateTariffDto) {
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_UPDATE, { id, data });
  }

  @Get('tariff/:id')
  async getTariffById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_FIND_BY_ID, id);
  }

  @Delete('tariff/:id')
  async deleteTariff(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_TARIFF_DELETE, id);
  }
  //====================================================================================================================PROFIT MARGIN===============================================================================
  @Post('profit-margin')
  async createProfitMargin(@Body() data: ProfitMarginDto) {
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_CREATE, data);
  }

  @Patch('profit-margin/:id')
  async updateProfitMargin(
    @Param('id') id: string,
    @Body() data: UpdateProfitMarginDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_UPDATE, {
      id,
      data,
    });
  }

  @Get('profit-margin')
  async getProfitMargin(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Get('profit-margin/:id')
  async getProfitMarginById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_FIND_BY_ID, id);
  }

  @Delete('profit-margin/:id')
  async deleteProfitMargin(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_PROFIT_MARGIN_DELETE, id);
  }
  //============================================================================================================================AIRPORT FEES===============================================================================
  @Post('airport-fee')
  async createAirportFee(@Body() data: AirportFeeDto) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_CREATE, data);
  }

  @Get('airport-fee')
  async getAirportFee( @Req() req, @Query() query: ListQueryDto) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_FIND_ALL, {
      headers: { authorization: req.headers['authorization'] || null },
      query
    });
  }

  @Patch('airport-fee/:id')
  async updateAirportFee(
    @Param('id') id: string,
    @Body() data: UpdateAirportFeeDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_UPDATE, {
      id,
      data,
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
  async getAirportFeeById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_FIND_BY_ID, id);
  }

  @Delete('airport-fee/:id')
  async deleteAirportFee(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_AIRPORT_FEE_DELETE, id);
  }
  //=================================================================================================================MISCELLANEOUS FEES===============================================================================
  @Post('misc-fee')
  async createMiscFee(@Body() data: MiscellaneousFeeDto) {
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_CREATE, data);
  }

  @Get('misc-fee')
  async getMiscFee(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Patch('misc-fee/:id')
  async updateMiscFee(
    @Param('id') id: string,
    @Body() data: UpdateMiscellaneousFeeDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_UPDATE, {
      id,
      data,
    });
  }

  @Get('misc-fee/:id')
  async getMiscFeeById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_FIND_BY_ID, id);
  }

  @Delete('misc-fee/:id')
  async deleteMiscFee(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_MISC_FEE_DELETE, id);
  }
  //==========================================================================================================SURCHARGE==================================================================================
  @Post('surcharge')
  async createSurcharge(@Body() data: SurchargeDto) {
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_CREATE, data);
  }

  @Get('surcharge')
  async getSurcharge(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Patch('surcharge/:id')
  async updateSurcharge(
    @Param('id') id: string,
    @Body() data: UpdateSurchargeDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_UPDATE, {
      id,
      data,
    });
  }

  @Get('surcharge/:id')
  async getSurchargeById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_FIND_BY_ID, id);
  }

  @Delete('surcharge/:id')
  async deleteSurcharge(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_SURCHARGE_DELETE, id);
  }
  //==========================================================================================================DISCOUNT==================================================================================
  @Post('discount')
  async createDiscount(@Body() data: DiscountDto) {
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_CREATE, data);
  }

  @Get('discount')
  async getDiscount(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Patch('discount/:id')
  async updateDiscount(
    @Param('id') id: string,
    @Body() data: UpdateDiscountDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_UPDATE, {
      id,
      data,
    });
  }

  @Get('discount/:id')
  async getDiscountById(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_FIND_BY_ID, id);
  }

  @Delete('discount/:id')
  async deleteDiscount(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_DISCOUNT_DELETE, id);
  }
  //====================================================================================================================CUSTOMER CATEGORY===============================================================================
  @Post('customer-category')
  async createCustomerCategory(@Body() data: CustomerCategoryDto) {
    return this.pricingClient.send(
      PATTERNS.PRICE_CUSTOMER_CATEGORY_CREATE,
      data,
    );
  }

  @Get('customer-category')
  async getCustomerCategory(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(
      PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_ALL,
      {
        headers: { authorization: authHeader },
        query
      },
    );
  }

  @Patch('customer-category/:id')
  async updateCustomerCategory(
    @Param('id') id: string,
    @Body() data: UpdateCustomerCategoryDto,
  ) {
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_UPDATE, {
      id,
      data,
    });
  }

  @Get('customer-category/:id')
  async getCustomerCategoryById(@Param('id') id: string) {
    return this.pricingClient.send(
      PATTERNS.PRICE_CUSTOMER_CATEGORY_FIND_BY_ID,
      id,
    );
  }

  @Delete('customer-category/:id')
  async deleteCustomerCategory(@Param('id') id: string) {
    return this.pricingClient.send(PATTERNS.PRICE_CUSTOMER_CATEGORY_DELETE, id);
  }
  //============================================================================================================PRICE CALCULATION AND LOG===============================================================================
  @Get('price-calculation-log')
  async getPriceCalculationLog(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    return this.pricingClient.send(PATTERNS.PRICE_CALCULATION_LOG_FIND_ALL, {
      headers: { authorization: authHeader },
      query
    });
  }

  @Get('price-calculation-log/:id')
  async getPriceCalculationLogById(@Param('id') id: string) {
    return this.pricingClient.send(
      PATTERNS.PRICE_CALCULATION_LOG_FIND_BY_ID,
      id,
    );
  }

  @Post('calculate')
  async calculatePrice(@Body() data: PriceCalculationLogDto) {
    return this.pricingClient.send(PATTERNS.PRICE_CALCULATE, data);
  }
}
