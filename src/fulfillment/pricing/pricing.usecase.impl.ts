import {
  AirportFee,
  DiscountRule,
  FeeType,
  MiscFee,
  ProfitMargin,
  ServiceType,
  ShippingScope,
  Surcharge,
} from '@prisma/client';
import { PricingRepository } from './pricing.repository';
import { PricingUseCases } from './pricing.usecase';
import {
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  MiscellaneousFeeDto,
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
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { handleCatch } from '../../common/handleCatch';
import { AppLogger } from '../../common/app-logger.service';

interface OrderLike {
  id: string;
  serviceType?: string;
  [key: string]: any;
}

interface FeeBreakdown {
  name?: string;
  amount: number;
  airportCode?: string;
  percentage?: number;
}
@Injectable()
export class PricingUseCasesImpl implements PricingUseCases {
  constructor(
    private readonly pricingRepo: PricingRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('FulfillmentService', 'PricingUsecaseImpl');
  }

  //===============================================================================================TARIFF===========================================================================================================
  /**
   * Create tariff with full validation.
   * - Business checks live here (no throws in repo).
   */
  async createTariff(data: TariffDto) {
    this.logger.log(`Creating new tariff: ${data.name}`);
    try {
      // 1️⃣ Validate customer category
      if (data.customerCategoryId) {
        const category = await this.pricingRepo.findCustomerCategoryById(
          data.customerCategoryId,
        );
        if (!category) {
          this.logger.warn(
            `Customer category not found: ${data.customerCategoryId}`,
          );
          throw new RpcException({
            statusCode: 404,
            message: `Customer Category with id ${data.customerCategoryId} not found.`,
          });
        }
      }

      // 2️⃣ Validate required fields
      if (!data.serviceType)
        throw new RpcException({
          statusCode: 400,
          message: 'serviceType is required',
        });
      if (data.baseFee == null || Number.isNaN(Number(data.baseFee)))
        throw new RpcException({
          statusCode: 400,
          message: 'baseFee must be a valid number',
        });
      if (Number(data.baseFee) < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'baseFee must be >= 0',
        });
      if (data.perKgRate != null && Number(data.perKgRate) < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'perKgRate must be >= 0',
        });
      if (data.perKmRate != null && Number(data.perKmRate) < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'perKmRate must be >= 0',
        });
      if (!data.currency || typeof data.currency !== 'string')
        throw new RpcException({
          statusCode: 400,
          message: 'currency is required',
        });

      const currency = data.currency.trim().toUpperCase();
      if (currency.length < 2 || currency.length > 5)
        throw new RpcException({
          statusCode: 400,
          message: 'currency must be 2-5 characters (e.g. ETB, USD)',
        });

      // 3️⃣ Validate dates
      const effectiveFrom = new Date(data.effectiveFrom);
      if (isNaN(effectiveFrom.getTime()))
        throw new RpcException({
          statusCode: 400,
          message: 'effectiveFrom is not a valid ISO date',
        });

      let effectiveTo: Date | null = null;
      if (data.effectiveTo) {
        effectiveTo = new Date(data.effectiveTo);
        if (isNaN(effectiveTo.getTime()))
          throw new RpcException({
            statusCode: 400,
            message: 'effectiveTo is not a valid ISO date',
          });
        if (effectiveFrom > effectiveTo)
          throw new RpcException({
            statusCode: 400,
            message: 'effectiveFrom must be on or before effectiveTo',
          });
      }

      // 4️⃣ Check overlapping tariffs
      const overlap = await this.pricingRepo.findOverlappingTariff(
        data.serviceType as ServiceType,
        effectiveFrom,
        effectiveTo,
        data.shippingScope as ShippingScope,
      );
      if (overlap)
        throw new RpcException({
          statusCode: 409,
          message: `Overlapping tariff exists (id=${overlap.id}, name="${overlap.name}")`,
        });

      // 5️⃣ Avoid duplicate name + serviceType + shippingScope
      const dup = await this.pricingRepo.findByNameAndServiceType(
        data.name.trim(),
        data.serviceType,
        data.shippingScope,
      );
      if (dup)
        throw new RpcException({
          statusCode: 409,
          message:
            'A tariff with the same name and service type already exists',
        });

      // 6️⃣ Ensure at least one pricing driver exists
      if (
        (data.baseFee === 0 || data.baseFee == null) &&
        (data.perKmRate == null || Number(data.perKmRate) === 0) &&
        (data.perKgRate == null || Number(data.perKgRate) === 0)
      ) {
        throw new RpcException({
          statusCode: 400,
          message:
            'Tariff must define at least one of baseFee, perKmRate or perKgRate with a positive value',
        });
      }

      // 7️⃣ Prepare payload
      const payload: any = {
        name: data.name.trim(),
        serviceType: data.serviceType,
        shippingScope: data.shippingScope,
        customerCategoryId: data.customerCategoryId,
        baseFee: Number(data.baseFee),
        perKmRate: data.perKmRate != null ? Number(data.perKmRate) : null,
        perKgRate: data.perKgRate != null ? Number(data.perKgRate) : null,
        currency,
        effectiveFrom,
        effectiveTo: effectiveTo ?? null,
        isActive: true,
      };
      this.logger.verbose(
        `Tariff payload prepared: ${JSON.stringify(payload)}`,
      );

      // 8️⃣ Call repository
      const created = await this.pricingRepo.createTariff(payload);
      this.logger.log(`Tariff created successfully: ${created.id}`);
      return created;
    } catch (error) {
      this.logger.error(`Failed to create tariff: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAllTariff(query: ListQueryDto): Promise<any> {
    try {
      return await this.pricingRepo.findAllTariff(query);
    } catch (error) {
      this.logger.error(`Failed to fetch tariffs: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findTariffById(id: string): Promise<any> {
    this.logger.log(`Fetching tariff by id: ${id}`);
    try {
      if (!id)
        throw new RpcException({
          statusCode: 400,
          message: 'Tariff ID is required',
        });
      const tariff = await this.pricingRepo.findTariffById(id);
      if (!tariff)
        throw new RpcException({
          statusCode: 404,
          message: 'Tariff not found',
        });
      return tariff;
    } catch (error) {
      this.logger.error(`Failed to fetch tariff ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async updateTariff(id: string, data: Partial<UpdateTariffDto>): Promise<any> {
    this.logger.log(`Updating tariff: ${id}`);
    try {
      if (!id)
        throw new RpcException({
          statusCode: 400,
          message: 'Tariff ID is required',
        });

      if (data.baseFee !== undefined && data.baseFee < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'baseFee must be >= 0',
        });
      if (data.perKgRate !== undefined && data.perKgRate < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'perKgRate must be >= 0',
        });
      if (data.perKmRate !== undefined && data.perKmRate < 0)
        throw new RpcException({
          statusCode: 400,
          message: 'perKmRate must be >= 0',
        });

      if (data.effectiveFrom && data.effectiveTo) {
        if (new Date(data.effectiveFrom) >= new Date(data.effectiveTo))
          throw new RpcException({
            statusCode: 400,
            message: 'effectiveFrom must be before effectiveTo',
          });
      }

      if (
        data.serviceType &&
        !Object.values(ServiceType).includes(data.serviceType)
      )
        throw new RpcException({
          statusCode: 400,
          message: 'Invalid serviceType',
        });

      const updated = await this.pricingRepo.updateTariff(id, data);
      this.logger.log(`Tariff updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update tariff ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async deleteTariff(id: string): Promise<any> {
    this.logger.log(`Deleting tariff: ${id}`);
    try {
      if (!id)
        throw new RpcException({
          statusCode: 400,
          message: 'Tariff ID is required',
        });
      const tariff = await this.pricingRepo.findTariffById(id);
      if (!tariff)
        throw new RpcException({
          statusCode: 404,
          message: 'Tariff not found',
        });
      const deleted = await this.pricingRepo.deleteTariff(id);
      this.logger.log(`Tariff deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete tariff ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  //===========================================================================================================================PROFIT MARGIN==============================================================================================================================
  async createProfitMargin(data: ProfitMarginDto) {
    this.logger.log(`Creating profit margin for tariff: ${data.tariffId}`);
    try {
      // 1️⃣ Check tariff exists
      const tariff = await this.pricingRepo.findTariffById(data.tariffId);
      if (!tariff) {
        this.logger.warn(`Tariff not found: ${data.tariffId}`);
        throw new RpcException({
          statusCode: 404,
          message: 'Tariff not found',
        });
      }

      // 2️⃣ Validate min/max logic
      if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
        throw new RpcException({
          statusCode: 400,
          message: 'minAmount cannot be greater than maxAmount',
        });
      }

      // 3️⃣ Validate percentage
      if (data.percentage < 0 || data.percentage > 100) {
        throw new RpcException({
          statusCode: 400,
          message: 'percentage must be between 0 and 100',
        });
      }

      // 4️⃣ Ensure no existing profit margin for this tariff
      const exists = await this.pricingRepo.findByTariffId(data.tariffId);
      if (exists) {
        throw new RpcException({
          statusCode: 409,
          message: 'Profit margin already exists for this tariff',
        });
      }

      // ✅ Create
      const created = await this.pricingRepo.createProfitMargin(data);
      this.logger.log(
        `Profit margin created successfully for tariff: ${data.tariffId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create profit margin: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAllProfitMargins(query: ListQueryDto) {
    this.logger.log('Fetching all profit margins');
    try {
      return await this.pricingRepo.findAll(query);
    } catch (error) {
      this.logger.error(`Failed to fetch profit margins: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findProfitMarginById(id: string) {
    this.logger.log(`Fetching profit margin by ID: ${id}`);
    try {
      const pm = await this.pricingRepo.findProfitMarginById(id);
      if (!pm)
        throw new RpcException({
          statusCode: 404,
          message: 'Profit margin not found',
        });
      return pm;
    } catch (error) {
      this.logger.error(
        `Failed to fetch profit margin ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async updateProfitMargin(id: string, data: UpdateProfitMarginDto) {
    this.logger.log(`Updating profit margin ID: ${id}`);
    try {
      const pm = await this.pricingRepo.findProfitMarginById(id);
      if (!pm)
        throw new RpcException({
          statusCode: 404,
          message: 'Profit margin not found',
        });

      // Validate min/max if both present
      if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
        throw new RpcException({
          statusCode: 400,
          message: 'minAmount cannot be greater than maxAmount',
        });
      }

      if (data.percentage && (data.percentage < 0 || data.percentage > 100)) {
        throw new RpcException({
          statusCode: 400,
          message: 'percentage must be between 0 and 100',
        });
      }

      const updated = await this.pricingRepo.updateProfitMargin(id, data);
      this.logger.log(`Profit margin updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update profit margin ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async deleteProfitMargin(id: string) {
    this.logger.log(`Deleting profit margin ID: ${id}`);
    try {
      const pm = await this.pricingRepo.findProfitMarginById(id);
      if (!pm)
        throw new RpcException({
          statusCode: 404,
          message: 'Profit margin not found',
        });

      const deleted = await this.pricingRepo.deleteProfitMargin(id);
      this.logger.log(`Profit margin deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(
        `Failed to delete profit margin ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  //==================================================================================================================AIRPORT FEES==============================================================================================================================
  async createAirportFee(data: AirportFeeDto) {
    this.logger.log(`Creating airport fee for tariff: ${data.tariffId}`);
    try {
      // 1️⃣ Check Tariff exists
      const tariff = await this.pricingRepo.findTariffById(data.tariffId);
      if (!tariff) {
        this.logger.warn(`Tariff not found: ${data.tariffId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Tariff with id ${data.tariffId} does not exist`,
        });
      }

      // 2️⃣ Validate fee type
      if (!data.perKgRate && !data.flatFee) {
        throw new RpcException({
          statusCode: 400,
          message: 'Either perKgRate or flatFee must be provided',
        });
      }

      // 3️⃣ Validate dates
      const from = new Date(data.effectiveFrom);
      const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
      if (to && from >= to) {
        throw new RpcException({
          statusCode: 400,
          message: 'effectiveFrom must be earlier than effectiveTo',
        });
      }

      // 4️⃣ Check for duplicate/overlap
      const overlap = await this.pricingRepo.findOverlappingAirportFee(
        data,
        from,
        to,
      );
      if (overlap) {
        throw new RpcException({
          statusCode: 409,
          message: `Overlapping airport fee already exists for ${data.airportCode} (${data.serviceType}) in this tariff`,
        });
      }

      // 5️⃣ Save
      const created = await this.pricingRepo.createAirportFee(data);
      this.logger.log(
        `Airport fee created successfully for tariff: ${data.tariffId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create airport fee: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAllAirportFees(query: ListQueryDto) {
    this.logger.log('Fetching all airport fees');
    try {
      return await this.pricingRepo.findAllAirportFees(query);
    } catch (error) {
      this.logger.error(`Failed to fetch airport fees: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAirportFeeById(id: string) {
    this.logger.log(`Fetching airport fee by ID: ${id}`);
    try {
      const fee = await this.pricingRepo.findAirportFeeById(id);
      if (!fee)
        throw new RpcException({
          statusCode: 404,
          message: `AirportFee with id ${id} not found`,
        });
      return fee;
    } catch (error) {
      this.logger.error(`Failed to fetch airport fee ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>) {
    this.logger.log(`Updating airport fee ID: ${id}`);
    try {
      if (data.effectiveFrom && data.effectiveTo) {
        const from = new Date(data.effectiveFrom);
        const to = new Date(data.effectiveTo);
        if (from >= to) {
          throw new RpcException({
            statusCode: 400,
            message: 'effectiveFrom must be earlier than effectiveTo',
          });
        }
      }
      const updated = await this.pricingRepo.updateAirportFee(id, data);
      this.logger.log(`Airport fee updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update airport fee ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async deleteAirportFee(id: string) {
    this.logger.log(`Deleting airport fee ID: ${id}`);
    try {
      const deleted = await this.pricingRepo.deleteAirportFee(id);
      this.logger.log(`Airport fee deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete airport fee ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  //==================================================================================================================MISCELLANEOUS FEES==============================================================================================================================

  async createMiscFee(data: MiscellaneousFeeDto) {
    this.logger.log(`Creating miscellaneous fee for tariff: ${data.tariffId}`);
    try {
      // 1️⃣ Check tariff exists
      const tariff = await this.pricingRepo.findTariffById(data.tariffId);
      if (!tariff) {
        this.logger.warn(`Tariff not found: ${data.tariffId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Tariff with id ${data.tariffId} does not exist`,
        });
      }

      // 2️⃣ Amount validations
      if (data.amount <= 0) {
        throw new RpcException({
          statusCode: 400,
          message: 'Amount must be greater than 0',
        });
      }
      if (
        data.feeType === FeeType.PERCENTAGE &&
        (data.amount <= 0 || data.amount > 100)
      ) {
        throw new RpcException({
          statusCode: 400,
          message: 'Percentage fee must be between 0 and 100',
        });
      }

      // 3️⃣ Date validations
      const from = new Date(data.effectiveFrom);
      const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
      if (to && from >= to) {
        throw new RpcException({
          statusCode: 400,
          message: 'effectiveFrom must be earlier than effectiveTo',
        });
      }

      // 4️⃣ Save
      const created = await this.pricingRepo.createMiscFee(data);
      this.logger.log(
        `Miscellaneous fee created successfully for tariff: ${data.tariffId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create miscellaneous fee: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAllMiscFees(query: ListQueryDto) {
    this.logger.log('Fetching all miscellaneous fees');
    try {
      return await this.pricingRepo.findAllMiscFees(query);
    } catch (error) {
      this.logger.error(`Failed to fetch miscellaneous fees: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findMiscFeeById(id: string) {
    this.logger.log(`Fetching miscellaneous fee by ID: ${id}`);
    try {
      const fee = await this.pricingRepo.findMiscFeeById(id);
      if (!fee)
        throw new RpcException({
          statusCode: 404,
          message: `MiscFee with id ${id} not found`,
        });
      return fee;
    } catch (error) {
      this.logger.error(
        `Failed to fetch miscellaneous fee ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>) {
    this.logger.log(`Updating miscellaneous fee ID: ${id}`);
    try {
      // Validate amount if provided
      if (data.amount !== undefined) {
        if (data.amount <= 0)
          throw new RpcException({
            statusCode: 400,
            message: 'Amount must be greater than 0',
          });
        if (
          data.feeType === FeeType.PERCENTAGE &&
          (data.amount <= 0 || data.amount > 100)
        ) {
          throw new RpcException({
            statusCode: 400,
            message: 'Percentage fee must be between 0 and 100',
          });
        }
      }
      // Validate dates if provided
      if (data.effectiveFrom && data.effectiveTo) {
        const from = new Date(data.effectiveFrom);
        const to = new Date(data.effectiveTo);
        if (from >= to)
          throw new RpcException({
            statusCode: 400,
            message: 'effectiveFrom must be earlier than effectiveTo',
          });
      }

      const updated = await this.pricingRepo.updateMiscFee(id, data);
      this.logger.log(`Miscellaneous fee updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update miscellaneous fee ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  async deleteMiscFee(id: string) {
    this.logger.log(`Deleting miscellaneous fee ID: ${id}`);
    try {
      const deleted = await this.pricingRepo.deleteMiscFee(id);
      this.logger.log(`Miscellaneous fee deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(
        `Failed to delete miscellaneous fee ${id}: ${error.message}`,
      );
      throw handleCatch(error);
    }
  }

  //===========================================================================================================================SURCHARGE==============================================================================================================================

  // ── CREATE ──
  async createSurcharge(data: SurchargeDto) {
    this.logger.log(`Creating surcharge for tariff: ${data.tariffId}`);
    try {
      // 1️⃣ Validate tariff existence
      const tariff = await this.pricingRepo.findTariffById(data.tariffId);
      if (!tariff) {
        this.logger.warn(`Tariff not found: ${data.tariffId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Tariff with id ${data.tariffId} not found`,
        });
      }

      // 2️⃣ Validate type
      if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
        });
      }

      // 3️⃣ Validate value
      if (data.value < 0) {
        throw new RpcException({
          statusCode: 400,
          message: `Surcharge value cannot be negative`,
        });
      }

      // 4️⃣ Optional: validate serviceType
      if (
        data.serviceType &&
        !Object.values(ServiceType).includes(data.serviceType)
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid serviceType "${data.serviceType}"`,
        });
      }

      // 5️⃣ Optional: validate shippingScope
      if (
        data.shippingScope &&
        !Object.values(ShippingScope).includes(data.shippingScope)
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid shippingScope "${data.shippingScope}"`,
        });
      }

      const created = await this.pricingRepo.createSurcharge(data);
      this.logger.log(
        `Surcharge created successfully for tariff: ${data.tariffId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create surcharge: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async updateSurcharge(id: string, data: Partial<UpdateSurchargeDto>) {
    this.logger.log(`Updating surcharge ID: ${id}`);
    try {
      const existing = await this.pricingRepo.findSurchargeById(id);
      if (!existing)
        throw new RpcException({
          statusCode: 404,
          message: `Surcharge with id ${id} not found`,
        });

      if (
        data.type &&
        !['percentage', 'fixed'].includes(data.type.toLowerCase())
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
        });
      }
      if (data.value !== undefined && data.value < 0) {
        throw new RpcException({
          statusCode: 400,
          message: `Surcharge value cannot be negative`,
        });
      }
      if (
        data.serviceType &&
        !Object.values(ServiceType).includes(data.serviceType)
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid serviceType "${data.serviceType}"`,
        });
      }
      if (
        data.shippingScope &&
        !Object.values(ShippingScope).includes(data.shippingScope)
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid shippingScope "${data.shippingScope}"`,
        });
      }

      const updated = await this.pricingRepo.updateSurcharge(id, data);
      this.logger.log(`Surcharge updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update surcharge ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findAllSurcharge(query: ListQueryDto) {
    this.logger.log('Fetching all surcharges');
    try {
      return await this.pricingRepo.findAllSurcharge(query);
    } catch (error) {
      this.logger.error(`Failed to fetch surcharges: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async findSurchargeById(id: string) {
    this.logger.log(`Fetching surcharge by ID: ${id}`);
    try {
      const surcharge = await this.pricingRepo.findSurchargeById(id);
      if (!surcharge)
        throw new RpcException({
          statusCode: 404,
          message: `Surcharge with id ${id} not found`,
        });
      return surcharge;
    } catch (error) {
      this.logger.error(`Failed to fetch surcharge ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  async deleteSurcharge(id: string) {
    this.logger.log(`Deleting surcharge ID: ${id}`);
    try {
      const existing = await this.pricingRepo.findSurchargeById(id);
      if (!existing)
        throw new RpcException({
          statusCode: 404,
          message: `Surcharge with id ${id} not found`,
        });

      const deleted = await this.pricingRepo.deleteSurcharge(id);
      this.logger.log(`Surcharge deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete surcharge ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  //============================================================================================================================================DISCOUNT================================================================================================================================

  // ── CREATE ──
  async createDiscount(data: DiscountDto) {
    this.logger.log(`Creating discount for tariff: ${data.tariffId}`);
    try {
      // 1️⃣ Validate tariff
      const tariff = await this.pricingRepo.findTariffById(data.tariffId);
      if (!tariff) {
        this.logger.warn(`Tariff not found: ${data.tariffId}`);
        throw new RpcException({
          statusCode: 404,
          message: `Tariff with id ${data.tariffId} not found`,
        });
      }

      // 2️⃣ Validate type
      if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid type "${data.type}". Allowed: percentage or fixed`,
        });
      }

      // 3️⃣ Validate value
      if (data.value < 0) {
        throw new RpcException({
          statusCode: 400,
          message: `Discount value cannot be negative`,
        });
      }

      // 4️⃣ Validate customer category (optional)
      if (data.customerCategoryId) {
        const category = await this.pricingRepo.findCustomerCategoryById(
          data.customerCategoryId,
        );
        if (!category) {
          throw new RpcException({
            statusCode: 404,
            message: `Customer category not found`,
          });
        }
      }

      // 5️⃣ Validate dates
      const validFrom = new Date(data.validFrom);
      const validTo = data.validTo ? new Date(data.validTo) : null;
      if (validTo && validFrom > validTo) {
        throw new RpcException({
          statusCode: 400,
          message: `validFrom cannot be after validTo`,
        });
      }

      const created = await this.pricingRepo.createDiscount({
        ...data,
        validFrom,
        validTo,
      });
      this.logger.log(
        `Discount created successfully for tariff: ${data.tariffId}`,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create discount: ${error.message}`);
      throw handleCatch(error);
    }
  }

  // ── UPDATE ──
  async updateDiscount(id: string, data: Partial<UpdateDiscountDto>) {
    this.logger.log(`Updating discount ID: ${id}`);
    try {
      const existing = await this.pricingRepo.findDiscountById(id);
      if (!existing)
        throw new RpcException({
          statusCode: 404,
          message: `Discount with id ${id} not found`,
        });

      if (
        data.type &&
        !['percentage', 'fixed'].includes(data.type.toLowerCase())
      ) {
        throw new RpcException({
          statusCode: 400,
          message: `Invalid type "${data.type}"`,
        });
      }

      if (data.value !== undefined && data.value < 0) {
        throw new RpcException({
          statusCode: 400,
          message: `Discount value cannot be negative`,
        });
      }

      if (data.customerCategoryId) {
        const category = await this.pricingRepo.findCustomerCategoryById(
          data.customerCategoryId,
        );
        if (!category)
          throw new RpcException({
            statusCode: 404,
            message: `Customer category not found`,
          });
      }

      // Date parsing & validation
      const validFrom = data.validFrom ? new Date(data.validFrom) : undefined;
      const validTo = data.validTo ? new Date(data.validTo) : undefined;
      if (validFrom && validTo && validFrom > validTo) {
        throw new RpcException({
          statusCode: 400,
          message: `validFrom cannot be after validTo`,
        });
      }

      const updated = await this.pricingRepo.updateDiscount(
        id,
        { ...data },
        validFrom,
        validTo,
      );
      this.logger.log(`Discount updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update discount ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  // ── GET ALL ──
  async findAllDiscount(query: ListQueryDto) {
    this.logger.log('Fetching all discounts');
    try {
      return await this.pricingRepo.findAllDiscount(query);
    } catch (error) {
      this.logger.error(`Failed to fetch discounts: ${error.message}`);
      throw handleCatch(error);
    }
  }

  // ── GET BY ID ──
  async findDiscountById(id: string) {
    this.logger.log(`Fetching discount by ID: ${id}`);
    try {
      const discount = await this.pricingRepo.findDiscountById(id);
      if (!discount)
        throw new RpcException({
          statusCode: 404,
          message: `Discount with id ${id} not found`,
        });
      return discount;
    } catch (error) {
      this.logger.error(`Failed to fetch discount ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  // ── DELETE ──
  async deleteDiscount(id: string) {
    this.logger.log(`Deleting discount ID: ${id}`);
    try {
      const existing = await this.pricingRepo.findDiscountById(id);
      if (!existing)
        throw new RpcException({
          statusCode: 404,
          message: `Discount with id ${id} not found`,
        });

      const deleted = await this.pricingRepo.deleteDiscount(id);
      this.logger.log(`Discount deleted successfully: ${id}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete discount ${id}: ${error.message}`);
      throw handleCatch(error);
    }
  }

  //==============================================================================================================================CUSTOMER CATEGORY============================================================================================================================================
  // ── CUSTOMER CATEGORY ──
  async createCustomerCategory(data: CustomerCategoryDto) {
    this.logger.log(`Creating customer category: ${data.name}`);
    const exists = await this.pricingRepo.findCustomerCategoryByName(data.name);
    if (exists) {
      throw new RpcException({
        code: 400,
        message: `Customer category "${data.name}" already exists.`,
      });
    }
    return await this.pricingRepo.createCustomerCategory(data);
  }

  async findAllCustomerCategory(query: ListQueryDto) {
    this.logger.log('Fetching all customer categories');
    return await this.pricingRepo.findAllCustomerCategory(query);
  }

  async findCustomerCategoryById(id: string) {
    this.logger.log(`Fetching customer category by ID: ${id}`);
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category) {
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });
    }
    return category;
  }

  async updateCustomerCategory(id: string, data: UpdateCustomerCategoryDto) {
    this.logger.log(`Updating customer category ID: ${id}`);
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category) {
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });
    }

    if (data.name) {
      const exists = await this.pricingRepo.findCustomerCategoryByName(
        data.name,
      );
      if (exists && exists.id !== id) {
        throw new RpcException({
          code: 400,
          message: `Customer category "${data.name}" already exists.`,
        });
      }
    }

    return await this.pricingRepo.updateCustomerCategory(id, data);
  }

  async deleteCustomerCategory(id: string) {
    this.logger.log(`Deleting customer category ID: ${id}`);
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category) {
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });
    }
    return await this.pricingRepo.deleteCustomerCategory(id);
  }

  //==================================================================================================================================================================PRICE CALCULATION LOG=============================================================================================================================================
  // ── PRICE CALCULATION LOG ──
  async createPriceCalculationLog(data: any): Promise<any> {
    this.logger.log('Creating price calculation log');
    return await this.pricingRepo.createPriceCalculationLog(data);
  }

  async findAllPriceCalculationLog(query: ListQueryDto): Promise<any> {
    this.logger.log('Fetching all price calculation logs');
    return await this.pricingRepo.findAllPriceCalculationLog(query);
  }

  async findPriceCalculationLogById(id: string): Promise<any> {
    this.logger.log(`Fetching price calculation log by ID: ${id}`);
    const log = await this.pricingRepo.findPriceCalculationLogById(id);
    if (!log) {
      throw new RpcException({
        code: 404,
        message: `Price calculation log with id ${id} not found.`,
      });
    }
    return log;
  }

  async deletePriceCalculationLog(id: string): Promise<any> {
    this.logger.log(`Deleting price calculation log ID: ${id}`);
    const log = await this.pricingRepo.findPriceCalculationLogById(id);
    if (!log) {
      throw new RpcException({
        code: 404,
        message: `Price calculation log with id ${id} not found.`,
      });
    }
    return await this.pricingRepo.deletePriceCalculationLog(id);
  }

  //=====================================================================================================PRICE CALCULATION=============================================================================================================================
  // async calculatePrice({
  //   orderId,
  //   userId,
  // }: {
  //   orderId: string;
  //   userId?: string;
  // }) {
  //   this.logger.log('Order calculate price : ', orderId);
  //   this.logger.log('User calculate price : ', userId);

  //   // 1️⃣ Get order and customer
  //   const order = await this.pricingRepo.getOrderById(orderId, {
  //     includeCustomer: true,
  //   });
  //   if (!order) {
  //     throw new RpcException({
  //       code: 404,
  //       message: `Order with id ${orderId} not found`,
  //     });
  //   }
  //   const customer = userId
  //     ? await this.pricingRepo.findCustomerById(userId)
  //     : null;

  //   let category = null;
  //   if (customer?.customerCategoryId) {
  //     category = await this.pricingRepo.findCustomerCategoryById(
  //       customer.customerCategoryId,
  //     );
  //   }
  //   // 2️⃣ Get tariff
  //   const tariff =
  //     await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(
  //       order.shippingScope,
  //       order.serviceType,
  //       category?.id,
  //     );
  //   if (!tariff) {
  //     throw new RpcException({
  //       code: 404,
  //       message: `Tariff not found for order scope ${order.shippingScope}, service type ${order.serviceType} and customer type ${category.name}`,
  //     });
  //   }

  //   const weight = order.weight || 0;
  //   const distance = order.distance || 0;
  //   let breakdown: any = {};

  //   // 3️⃣ Base price
  //   let basePrice =
  //     tariff.baseFee +
  //     (tariff.perKgRate || 0) * weight +
  //     (tariff.perKmRate || 0) * distance;
  //   breakdown.basePrice = basePrice;

  //   // 4️⃣ Misc fees
  //   let miscTotal = 0;
  //   breakdown.miscFees = [];
  //   tariff.miscFees.forEach((fee) => {
  //     // 1️⃣ Check serviceType
  //     if (fee.serviceType && fee.serviceType !== order.serviceType) return;

  //     // 2️⃣ Check dynamic conditions
  //     let applyFee = true;
  //     if (fee.condition) {
  //       for (const [key, value] of Object.entries(fee.condition)) {
  //         const orderValue = (order as any)[key];

  //         if (typeof value === 'object') {
  //           if (value.gte !== undefined && orderValue < value.gte)
  //             applyFee = false;
  //           if (value.lte !== undefined && orderValue > value.lte)
  //             applyFee = false;
  //         } else if (orderValue !== value) {
  //           applyFee = false;
  //         }
  //       }
  //     }
  //     if (!applyFee) return;

  //     // 3️⃣ Apply fee
  //     let feeAmount = 0;
  //     if (fee.isPercentage) feeAmount = (basePrice * fee.amount) / 100;
  //     else if (fee.feeType === 'FLAT') feeAmount = fee.amount;
  //     else if (fee.feeType === 'PER_KG') feeAmount = fee.amount * weight;
  //     else if (fee.feeType === 'PER_KM') feeAmount = fee.amount * distance;

  //     miscTotal += feeAmount;
  //     breakdown.miscFees.push({ name: fee.name, amount: feeAmount });
  //   });

  //   // 5️⃣ Airport fees
  //   let airportFeeTotal = 0;
  //   breakdown.airportFees = [];
  //   tariff.airportFees.forEach((fee) => {
  //     if (!fee.serviceType || fee.serviceType === order.serviceType) {
  //       let feeAmount = 0;
  //       if (fee.perKgRate) feeAmount += fee.perKgRate * weight;
  //       if (fee.flatFee) feeAmount += fee.flatFee;

  //       airportFeeTotal += feeAmount;
  //       breakdown.airportFees.push({
  //         airportCode: fee.airportCode,
  //         amount: feeAmount,
  //       });
  //     }
  //   });

  //   // 6️⃣ Surcharges
  //   let surchargeTotal = 0;
  //   breakdown.surcharges = [];
  //   tariff.surcharges.forEach((s) => {
  //     if (!s.serviceType || s.serviceType === order.serviceType) {
  //       let feeAmount =
  //         s.type === 'percentage'
  //           ? ((basePrice + miscTotal + airportFeeTotal) * s.value) / 100
  //           : s.value;

  //       surchargeTotal += feeAmount;
  //       breakdown.surcharges.push({ name: s.name, amount: feeAmount });
  //     }
  //   });

  //   // 7️⃣ Discounts
  //   let discountTotal = 0;
  //   breakdown.discounts = [];
  //   if (userId) {
  //     // const category =
  //     //   await this.pricingRepo.getCustomerCategoryByUserId(userId);
  //     if (category) {
  //       const discounts = await this.pricingRepo.getDiscountRules(
  //         tariff.id,
  //         category.id,
  //       );
  //       discounts.forEach((d) => {
  //         let discountAmount =
  //           d.type === 'percentage'
  //             ? ((basePrice + miscTotal + airportFeeTotal + surchargeTotal) *
  //                 d.value) /
  //               100
  //             : d.value;

  //         discountTotal += discountAmount;
  //         breakdown.discounts.push({ name: d.name, amount: -discountAmount }); // negative because it reduces price
  //       });
  //     }
  //   }

  //   // 8️⃣ Profit margin
  //   let profitTotal = 0;
  //   breakdown.profitMargins = [];
  //   tariff.profitMargins.forEach((pm) => {
  //     if (!pm.serviceType || pm.serviceType === order.serviceType) {
  //       let pmValue =
  //         (basePrice +
  //           miscTotal +
  //           airportFeeTotal +
  //           surchargeTotal -
  //           discountTotal) *
  //         (pm.percentage / 100);
  //       if (pm.minAmount && pmValue < pm.minAmount) pmValue = pm.minAmount;
  //       if (pm.maxAmount && pmValue > pm.maxAmount) pmValue = pm.maxAmount;

  //       profitTotal += pmValue;
  //       breakdown.profitMargins.push({
  //         percentage: pm.percentage,
  //         amount: pmValue,
  //       });
  //     }
  //   });

  //   // 9️⃣ Final price
  //   const finalPrice =
  //     basePrice +
  //     miscTotal +
  //     airportFeeTotal +
  //     surchargeTotal -
  //     discountTotal +
  //     profitTotal;
  //   breakdown.finalPrice = finalPrice;
  //   // 🔟 Log calculation
  //   await this.pricingRepo.logPriceCalculation({
  //     orderId: order.id,
  //     weight,
  //     distance,
  //     baseRate: basePrice,
  //     appliedRate: basePrice + miscTotal + airportFeeTotal + surchargeTotal,
  //     surcharges: tariff.surcharges.map((s) => ({
  //       name: s.name,
  //       value: s.value,
  //     })),
  //     discounts: discountTotal ? [{ total: discountTotal }] : [],
  //     miscFees: tariff.miscFees.map((f) => ({
  //       name: f.name,
  //       amount: f.amount,
  //     })),
  //     profit: profitTotal ? { total: profitTotal } : {},
  //     airportFee: airportFeeTotal ? { total: airportFeeTotal } : {},
  //     finalPrice,
  //     currency: tariff.currency || 'ETB',
  //   });
  //   return { finalPrice, currency: tariff.currency || 'ETB', breakdown };
  // }

  // async calculatePrice(orderId: string, userId?: string) {
  //   this.logger.log(
  //     `🔹 Calculating price for Order ID: ${orderId}, User ID: ${userId || 'N/A'}`,
  //   );

  //   // 1️⃣ Fetch order & optional customer concurrently
  //   const [order, customer] = await Promise.all([
  //     this.pricingRepo.getOrderById(orderId, { includeCustomer: true }),
  //     userId
  //       ? this.pricingRepo.findCustomerById(userId)
  //       : Promise.resolve(null),
  //   ]);

  //   if (!order) {
  //     return { result: null, error: `Order ${orderId} not found` };
  //   }

  //   this.logger.log(
  //     `Order found: ${order.id}, Customer: ${order.customer?.name || 'N/A'}`,
  //   );

  //   // 2️⃣ Resolve customer category if exists
  //   const category = customer?.customerCategoryId
  //     ? await this.pricingRepo.findCustomerCategoryById(
  //         customer.customerCategoryId,
  //       )
  //     : null;

  //   if (category)
  //     this.logger.log(`🔹 Customer Category: ${category.name} (${category.id})`);

  //   // 3️⃣ Fetch tariff
  //   const tariff =
  //     await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(
  //       order.shippingScope,
  //       order.serviceType,
  //       category?.id,
  //     );

  //   if (!tariff) {
  //     return {
  //       result: null,
  //       error: `Tariff not found for ${order.shippingScope}/${order.serviceType}/${category?.name || 'None'}`,
  //     };
  //   }

  //   this.logger.log(`Tariff found: ${tariff.name} (${tariff.id})`);

  //   const { weight = 0, distance = 0 } = order;
  //   const breakdown: any = {};

  //   // 4️⃣ Base price calculation
  //   const basePrice =
  //     tariff.baseFee +
  //     (tariff.perKgRate || 0) * weight +
  //     (tariff.perKmRate || 0) * distance;
  //   breakdown.basePrice = basePrice;

  //   this.logger.log('Calculating additional fees...');

  //   // 5️⃣ Compute all additional fees in parallel
  //   const [miscTotal, miscFees] = this.calculateMiscFees(
  //     tariff.miscFees,
  //     order,
  //     basePrice,
  //     weight,
  //     distance,
  //   );
  //   const [airportFeeTotal, airportFees] = this.calculateAirportFees(
  //     tariff.airportFees,
  //     order,
  //     weight,
  //   );
  //   const [surchargeTotal, surcharges] = this.calculateSurcharges(
  //     tariff.surcharges,
  //     order,
  //     basePrice,
  //     miscTotal,
  //     airportFeeTotal,
  //   );
  //   const [discountTotal, discounts] = category
  //     ? await this.calculateDiscounts(
  //         tariff.id,
  //         category.id,
  //         basePrice,
  //         miscTotal,
  //         airportFeeTotal,
  //         surchargeTotal,
  //       )
  //     : [0, []];
  //   const [profitTotal, profitMargins] = this.calculateProfitMargins(
  //     tariff.profitMargins,
  //     order,
  //     basePrice,
  //     miscTotal,
  //     airportFeeTotal,
  //     surchargeTotal,
  //     discountTotal,
  //   );

  //   // 🔟 Final price calculation
  //   const finalPrice =
  //     basePrice +
  //     miscTotal +
  //     airportFeeTotal +
  //     surchargeTotal -
  //     discountTotal +
  //     profitTotal;
  //   breakdown.finalPrice = finalPrice;

  //   breakdown.miscFees = miscFees;
  //   breakdown.airportFees = airportFees;
  //   breakdown.surcharges = surcharges;
  //   breakdown.discounts = discounts;
  //   breakdown.profitMargins = profitMargins;

  //   this.logger.log('🔹 Price breakdown:', JSON.stringify(breakdown, null, 2));

  //   // 1️⃣1️⃣ Log price calculation and update order (background)
  //   this.pricingRepo
  //     .logPriceCalculationAndUpdateOrder({
  //       orderId: order.id,
  //       weight,
  //       distance,
  //       baseRate: basePrice,
  //       appliedRate: basePrice + miscTotal + airportFeeTotal + surchargeTotal,
  //       surcharges,
  //       discounts,
  //       miscFees,
  //       profit: { total: profitTotal },
  //       airportFee: { total: airportFeeTotal },
  //       finalPrice,
  //       currency: tariff.currency || 'ETB',
  //     })
  //     .catch((err) => this.logger.error('Failed to log price calculation:', err));

  //   return {
  //     result: { finalPrice, currency: tariff.currency || 'ETB', breakdown },
  //     error: null,
  //   };
  // }

  async calculatePrice(orderId: string, userId?: string) {
    this.logger.log(
      `🔹 Calculating price for Order ID: ${orderId}, User ID: ${userId || 'N/A'}`,
    );

    // 1️⃣ Fetch order & customer concurrently
    const [order, customer] = await Promise.all([
      this.pricingRepo.getOrderById(orderId, { includeCustomer: true }),
      userId
        ? this.pricingRepo.findCustomerById(userId)
        : Promise.resolve(null),
    ]);

    if (!order) {
      return { result: null, error: `Order ${orderId} not found` };
    }

    this.logger.log(
      `🔹 Order found: ${order.id}, Customer: ${order.customer?.name || 'N/A'}`,
    );

    // 2️⃣ Fetch customer category if available
    const category = customer?.customerCategoryId
      ? await this.pricingRepo.findCustomerCategoryById(
          customer.customerCategoryId,
        )
      : null;

    if (category)
      this.logger.log(
        `🔹 Customer Category: ${category.name} (${category.id})`,
      );

    // 3️⃣ Fetch applicable tariff
    const tariff =
      await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(
        order.shippingScope,
        order.serviceType,
        category?.id,
      );

    if (!tariff) {
      return {
        result: null,
        error: `Tariff not found for ${order.shippingScope}/${order.serviceType}/${category?.name || 'None'}`,
      };
    }

    const weight = order.weight || 0;
    const distance = order.distance || 0;
    const breakdown: any = {};

    // 4️⃣ Base price calculation
    const basePrice =
      (tariff.baseFee || 0) +
      (tariff.perKgRate || 0) * weight +
      (tariff.perKmRate || 0) * distance;
    breakdown.basePrice = basePrice;

    // 5️⃣ Calculate misc fees
    const [miscTotal, miscFees] = this.calculateMiscFees(
      tariff.miscFees || [],
      order,
      basePrice,
      weight,
      distance,
    );

    // 6️⃣ Calculate airport fees
    const [airportTotal, airportFees] = this.calculateAirportFees(
      tariff.airportFees || [],
      order,
      weight,
    );

    // 7️⃣ Calculate surcharges
    const [surchargeTotal, surcharges] = this.calculateSurcharges(
      tariff.surcharges || [],
      order,
      basePrice,
      miscTotal,
      airportTotal,
    );

    // 8️⃣ Calculate discounts
    const [discountTotal, discounts] = category
      ? await this.calculateDiscounts(
          tariff.id,
          category.id,
          basePrice,
          miscTotal,
          airportTotal,
          surchargeTotal,
        )
      : [0, []];

    // 9️⃣ Calculate profit margins
    const [profitTotal, profitMargins] = this.calculateProfitMargins(
      tariff.profitMargins || [],
      order,
      basePrice,
      miscTotal,
      airportTotal,
      surchargeTotal,
      discountTotal,
    );

    // 🔟 Final price
    const finalPrice =
      basePrice +
      miscTotal +
      airportTotal +
      surchargeTotal -
      discountTotal +
      profitTotal;
    breakdown.finalPrice = finalPrice;
    breakdown.miscFees = miscFees;
    breakdown.airportFees = airportFees;
    breakdown.surcharges = surcharges;
    breakdown.discounts = discounts;
    breakdown.profitMargins = profitMargins;

    this.logger.log('🔹 Price breakdown:', JSON.stringify(breakdown, null, 2));

    // 1️⃣1️⃣ Save calculation & update order in background
    await this.pricingRepo.logPriceCalculationAndUpdateOrder({
      orderId: order.id,
      weight,
      distance,
      baseRate: basePrice,
      appliedRate: basePrice + miscTotal + airportTotal + surchargeTotal,
      surcharges,
      discounts,
      miscFees,
      profit: { total: profitTotal },
      airportFee: { total: airportTotal },
      finalPrice,
      currency: tariff.currency || 'ETB',
    });

    return {
      result: {
        finalPrice,
        currency: tariff.currency || 'ETB',
        breakdown,
      },
      error: null,
    };
  }

  //===========================================================HELPER METHODS===========================================================================================================

  /**
   * Calculate miscellaneous fees based on order conditions.
   */
  private calculateMiscFees(
    fees: MiscFee[],
    order: OrderLike,
    basePrice: number,
    weight: number,
    distance: number,
  ): [number, FeeBreakdown[]] {
    let total = 0;
    const list: FeeBreakdown[] = [];

    for (const fee of fees) {
      if (fee.serviceType && fee.serviceType !== order.serviceType) continue;

      let apply = true;
      if (fee.condition) {
        const condition = fee.condition as Record<string, any>;
        for (const [key, val] of Object.entries(condition)) {
          const orderVal = (order as any)[key];
          if (typeof val === 'object') {
            if (val.gte !== undefined && orderVal < val.gte) apply = false;
            if (val.lte !== undefined && orderVal > val.lte) apply = false;
          } else if (orderVal !== val) apply = false;
        }
      }
      if (!apply) continue;

      let amount = 0;
      switch (fee.feeType) {
        case 'PERCENTAGE':
          amount = (basePrice * fee.amount) / 100;
          break;
        case 'PER_KG':
          amount = fee.amount * weight;
          break;
        case 'PER_KM':
          amount = fee.amount * distance;
          break;
        default: // FLAT
          amount = fee.amount;
      }

      total += amount;
      list.push({ name: fee.name, amount });
    }

    return [total, list];
  }

  private calculateAirportFees(
    fees: AirportFee[],
    order: OrderLike,
    weight: number,
  ): [number, FeeBreakdown[]] {
    let total = 0;
    const list: FeeBreakdown[] = [];

    for (const fee of fees) {
      if (!fee.serviceType || fee.serviceType === order.serviceType) {
        const amount = (fee.perKgRate ?? 0) * weight + (fee.flatFee ?? 0);
        total += amount;
        list.push({ airportCode: fee.airportCode, amount });
      }
    }

    return [total, list];
  }

  private calculateSurcharges(
    fees: Surcharge[],
    order: OrderLike,
    basePrice: number,
    miscTotal: number,
    airportTotal: number,
  ): [number, FeeBreakdown[]] {
    let total = 0;
    const list: FeeBreakdown[] = [];

    for (const s of fees) {
      if (!s.isActive) continue;
      if (s.serviceType && s.serviceType !== order.serviceType) continue;

      const subtotal = basePrice + miscTotal + airportTotal;
      const amount =
        s.type === 'percentage' ? (subtotal * s.value) / 100 : s.value;

      total += amount;
      list.push({ name: s.name, amount });
    }

    return [total, list];
  }

  private async calculateDiscounts(
    tariffId: string,
    categoryId: string,
    basePrice: number,
    miscTotal: number,
    airportTotal: number,
    surchargeTotal: number,
  ): Promise<[number, FeeBreakdown[]]> {
    const discounts = await this.pricingRepo.getDiscountRules(
      tariffId,
      categoryId,
    );
    let total = 0;
    const list: FeeBreakdown[] = [];

    for (const d of discounts as DiscountRule[]) {
      if (!d.isActive) continue;
      const subtotal = basePrice + miscTotal + airportTotal + surchargeTotal;
      const amount =
        d.type === 'percentage' ? (subtotal * d.value) / 100 : d.value;
      total += amount;
      list.push({ name: d.name, amount: -amount }); // Negative for discount
    }

    return [total, list];
  }

  private calculateProfitMargins(
    fees: ProfitMargin[],
    order: OrderLike,
    basePrice: number,
    miscTotal: number,
    airportTotal: number,
    surchargeTotal: number,
    discountTotal: number,
  ): [number, FeeBreakdown[]] {
    let total = 0;
    const list: FeeBreakdown[] = [];

    for (const pm of fees) {
      if (pm.serviceType && pm.serviceType !== order.serviceType) continue;

      const subtotal =
        basePrice + miscTotal + airportTotal + surchargeTotal - discountTotal;
      let value = subtotal * (pm.percentage / 100);

      if (pm.minAmount && value < pm.minAmount) value = pm.minAmount;
      if (pm.maxAmount && value > pm.maxAmount) value = pm.maxAmount;

      total += value;
      list.push({ percentage: pm.percentage, amount: value });
    }

    return [total, list];
  }
}
