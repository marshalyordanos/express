import { FeeType, ServiceType, ShippingScope } from '@prisma/client';
import { PricingRepository } from './pricing.repository';
import { PricingUseCases } from './pricing.usecase';
import {
  AddCommissionDto,
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  MiscellaneousFeeDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
  UpdateAirportFeeDto,
  updateCommissionDto,
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
import { CreateOrderDto } from '../order/order.entity';
import { MapsService } from '../maps/maps.service';

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
    private readonly mapsService: MapsService,
  ) {
    this.logger.setContext('FulfillmentService', 'PricingUsecaseImpl');
  }

  //===============================================================================================TARIFF===========================================================================================================
  /**
   * Create tariff with full validation.
   * - Business checks live here (no throws in repo).
   */
  // async createTariff(data: TariffDto) {
  //   this.logger.log(`Creating new tariff: ${data.name}`);
  //   try {
  //     // 1️⃣ Validate customer category
  //     if (data.customerCategoryId) {
  //       const category = await this.pricingRepo.findCustomerCategoryById(
  //         data.customerCategoryId,
  //       );
  //       if (!category) {
  //         this.logger.warn(
  //           `Customer category not found: ${data.customerCategoryId}`,
  //         );
  //         throw new RpcException({
  //           statusCode: 404,
  //           message: `Customer Category with id ${data.customerCategoryId} not found.`,
  //         });
  //       }
  //     }

  //     // 2️⃣ Validate required fields
  //     if (!data.shippingScope)
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'Shipping scope is required',
  //       });
  //     if (data.baseFee == null || Number.isNaN(Number(data.baseFee)))
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'baseFee must be a valid number',
  //       });
  //     if (Number(data.baseFee) < 0)
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'baseFee must be >= 0',
  //       });
  //     if (data.perKgRate != null && Number(data.perKgRate) < 0)
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'perKgRate must be >= 0',
  //       });
  //     if (data.perKmRate != null && Number(data.perKmRate) < 0)
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'perKmRate must be >= 0',
  //       });
  //     if (!data.currency || typeof data.currency !== 'string')
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'currency is required',
  //       });

  //     const currency = data.currency.trim().toUpperCase();
  //     if (currency.length < 2 || currency.length > 5)
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'currency must be 2-5 characters (e.g. ETB, USD)',
  //       });

  //     // 3️⃣ Validate dates
  //     const effectiveFrom = new Date(data.effectiveFrom);
  //     if (isNaN(effectiveFrom.getTime()))
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'effectiveFrom is not a valid ISO date',
  //       });

  //     let effectiveTo: Date | null = null;
  //     if (data.effectiveTo) {
  //       effectiveTo = new Date(data.effectiveTo);
  //       if (isNaN(effectiveTo.getTime()))
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'effectiveTo is not a valid ISO date',
  //         });
  //       if (effectiveFrom > effectiveTo)
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'effectiveFrom must be on or before effectiveTo',
  //         });
  //     }

  //     // 4️⃣ Check overlapping tariffs
  //     const overlap = await this.pricingRepo.findOverlappingTariff(
  //       data.serviceType as ServiceType,
  //       effectiveFrom,
  //       effectiveTo,
  //       data.shippingScope as ShippingScope,
  //     );
  //     if (overlap)
  //       throw new RpcException({
  //         statusCode: 409,
  //         message: `Overlapping tariff exists (id=${overlap.id}, name="${overlap.name}")`,
  //       });

  //     // 5️⃣ Avoid duplicate name + serviceType + shippingScope
  //     const dup = await this.pricingRepo.findByNameAndServiceType(
  //       data.name.trim(),
  //       data.serviceType,
  //       data.shippingScope,
  //     );
  //     if (dup)
  //       throw new RpcException({
  //         statusCode: 409,
  //         message:
  //           'A tariff with the same name and service type already exists',
  //       });

  //     // 6️⃣ Ensure at least one pricing driver exists
  //     if (
  //       (data.baseFee === 0 || data.baseFee == null) &&
  //       (data.perKmRate == null || Number(data.perKmRate) === 0) &&
  //       (data.perKgRate == null || Number(data.perKgRate) === 0)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message:
  //           'Tariff must define at least one of baseFee, perKmRate or perKgRate with a positive value',
  //       });
  //     }

  //     // 7️⃣ Prepare payload
  //     const payload: any = {
  //       name: data.name.trim(),
  //       serviceType: data.serviceType,
  //       shippingScope: data.shippingScope,
  //       customerCategoryId: data.customerCategoryId,
  //       baseFee: Number(data.baseFee),
  //       perKmRate: data.perKmRate != null ? Number(data.perKmRate) : null,
  //       perKgRate: data.perKgRate != null ? Number(data.perKgRate) : null,
  //       currency,
  //       effectiveFrom,
  //       effectiveTo: effectiveTo ?? null,
  //       isActive: true,
  //     };
  //     this.logger.verbose(
  //       `Tariff payload prepared: ${JSON.stringify(payload)}`,
  //     );

  //     // 8️⃣ Call repository
  //     const created = await this.pricingRepo.createTariff(payload);
  //     this.logger.log(`Tariff created successfully: ${created.id}`);
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create tariff: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  async createTariff(data: TariffDto, userId: string) {
    this.logger.log(`Creating new tariff: ${data.name}`);

    try {
      // ----------------------------------------------------
      // 1. VALIDATION
      // ----------------------------------------------------
      if (!data.serviceTypes?.length) {
        throw new RpcException({
          statusCode: 400,
          message: 'serviceTypes must be non-empty',
        });
      }

      if (!data.weightBrackets?.length) {
        throw new RpcException({
          statusCode: 400,
          message: 'weightBrackets must be non-empty',
        });
      }

      if (data.customerCategoryId) {
        const category = await this.pricingRepo.findCustomerCategoryById(
          data.customerCategoryId,
        );
        if (!category) {
          throw new RpcException({
            statusCode: 404,
            message: 'Customer category not found',
          });
        }
      }

      const currency = (data.currency ?? 'ETB').trim().toUpperCase();
      const effectiveFrom = new Date(data.effectiveFrom);
      const effectiveTo = data.effectiveTo ? new Date(data.effectiveTo) : null;

      // Validate weight brackets
      const sorted = [...data.weightBrackets].sort((a, b) => a.minKg - b.minKg);

      for (let i = 0; i < sorted.length; i++) {
        const w = sorted[i];

        // Basic validation
        if (w.minKg < 0 || w.maxKg <= 0 || w.maxKg < w.minKg) {
          throw new RpcException({
            statusCode: 400,
            message: `Invalid weight bracket: ${JSON.stringify(w)}`,
          });
        }

        // Allow touching (minKg == previous maxKg), forbid overlap
        if (i > 0 && w.minKg < sorted[i - 1].maxKg) {
          throw new RpcException({
            statusCode: 400,
            message: `Overlapping weight bracket: ${JSON.stringify(w)}`,
          });
        }
      }

      // Validate driver commissions
      (data.driverCommissions || []).forEach((dc) => {
        if (
          !dc.vehicleTypeId ||
          (dc.fixed == null && dc.perKm == null && dc.percentage == null)
        ) {
          throw new RpcException({
            statusCode: 400,
            message: `Invalid driver commission: ${JSON.stringify(dc)}`,
          });
        }
      });

      // ----------------------------------------------------
      // 2. BUILD PAYLOAD FOR PRISMA
      // ----------------------------------------------------
      const payload: any = {
        name: data.name.trim(),
        shippingScope: data.shippingScope,
        currency,
        effectiveFrom,
        effectiveTo,
        isActive: true,
        createdBy: userId ?? null,

        // --- Service Types ---
        serviceTypes: {
          create: data.serviceTypes.map((s) => ({
            serviceType: s.type,
            baseFee: s.value,
          })),
        },

        // --- Weight Buckets ---
        weightBuckets: {
          create: data.weightBrackets.map((w) => ({
            startKg: w.minKg,
            endKg: w.maxKg,
            price: w.rate,
          })),
        },

        // --- Driver Commissions ---
        driverCommissions: {
          create: data.driverCommissions.map((dc) => ({
            vehicleTypeId: dc.vehicleTypeId, // <-- USING ID NOW
            fixed: dc.fixed ?? null,
            perKm: dc.perKm ?? null,
            percentage: dc.percentage ?? null,
          })),
        },

        // --- Misc Charges ---
        miscCharges: {
          create:
            data.additionalCharges?.costPerKm != null
              ? [
                  {
                    name: 'cost_per_km',
                    flatFee: data.additionalCharges.costPerKm,
                  },
                ]
              : [],
        },

        // --- Airport Fee ---
        airportFee:
          data.airportFee && data.shippingScope !== 'TOWN'
            ? { create: { amount: data.airportFee.price } }
            : undefined,

        // --- Profit Margin ---
        profitMargin:
          data.additionalCharges?.profitMargin != null
            ? { create: { percentage: data.additionalCharges.profitMargin } }
            : undefined,
      };

      // Remove undefined keys
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

      this.logger.verbose(
        `Tariff creation payload :: ${JSON.stringify(payload)}`,
      );

      // ----------------------------------------------------
      // 3. SAVE TO DB
      // ----------------------------------------------------
      const created = await this.pricingRepo.createTariff(payload);

      this.logger.log(`Tariff created successfully: ${created.id}`);

      return created;
    } catch (error) {
      this.logger.error(
        `Failed to create tariff: ${error?.message || error.toString()}`,
      );
      throw error;
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

  async updateTariff(id: string, data: UpdateTariffDto, userId: string) {
    this.logger.log(`Updating tariff ${id}`);

    try {
      // Validate serviceTypes if provided
      if (data.serviceTypes && data.serviceTypes.length === 0) {
        throw new RpcException({
          statusCode: 400,
          message: 'serviceTypes cannot be empty',
        });
      }

      // Validate weight brackets if provided
      // Validate weight brackets with detailed logging
      const sorted = [...data.weightBrackets].sort((a, b) => a.minKg - b.minKg);

      this.logger.log(
        `🔹 Weight brackets sorted for validation: ${JSON.stringify(sorted)}`,
      );

      for (let i = 0; i < sorted.length; i++) {
        const w = sorted[i];

        this.logger.log(
          `🔹 Checking bracket #${i + 1}: minKg=${w.minKg}, maxKg=${w.maxKg}, rate=${w.rate}`,
        );

        // Basic validation
        if (w.minKg < 0 || w.maxKg <= 0 || w.maxKg < w.minKg) {
          this.logger.error(
            `❌ Invalid weight bracket detected: ${JSON.stringify(w)}`,
          );
          throw new RpcException({
            statusCode: 400,
            message: `Invalid weight bracket: ${JSON.stringify(w)}`,
          });
        } else {
          this.logger.log(`✅ Bracket #${i + 1} basic validation passed`);
        }


        // Allow touching (minKg == previous maxKg), forbid overlap
        if (i > 0) {
          const prev = sorted[i - 1];
          this.logger.log(
            `🔹 Comparing with previous bracket: minKg=${prev.minKg}, maxKg=${prev.maxKg}`,
          );

          if (w.minKg < prev.maxKg) {
            this.logger.error(
              `❌ Overlapping weight bracket detected: current=${JSON.stringify(
                w,
              )}, previous=${JSON.stringify(prev)}`,
            );
            throw new RpcException({
              statusCode: 400,
              message: `Overlapping weight bracket: ${JSON.stringify(w)}`,
            });
          } else if (w.minKg === prev.maxKg) {
            this.logger.log(
              `⚡ Bracket touches previous bracket at boundary (minKg=${w.minKg} == prev.maxKg=${prev.maxKg})`,
            );
          } else {
            this.logger.log(`✅ No overlap with previous bracket`);
          }
        }
      }

      this.logger.log(`🔹 All weight brackets validated successfully`);

      // Validate commissions
      if (data.driverCommissions) {
        data.driverCommissions.forEach((dc) => {
          if (
            !dc.vehicleTypeId ||
            (dc.fixed == null && dc.perKm == null && dc.percentage == null)
          ) {
            throw new RpcException({
              statusCode: 400,
              message: `Invalid driver commission: ${JSON.stringify(dc)}`,
            });
          }
        });
      }

      // Build partial update payload
      const payload: any = {
        updatedAt: new Date(),
      };

      if (data.name) payload.name = data.name.trim();

      if (data.shippingScope) payload.shippingScope = data.shippingScope;
      if (data.currency) payload.currency = data.currency.trim().toUpperCase();
      if (data.effectiveFrom)
        payload.effectiveFrom = new Date(data.effectiveFrom);
      if (data.effectiveTo) payload.effectiveTo = new Date(data.effectiveTo);
      // payload.updatedBy = userId;
      payload.updatedAt = new Date();

      // Children — replace logic
      if (data.serviceTypes) {
        payload.serviceTypes = {
          deleteMany: {},
          create: data.serviceTypes.map((s) => ({
            serviceType: s.type,
            baseFee: s.value,
          })),
        };
      }

      if (data.weightBrackets) {
        payload.weightBuckets = {
          deleteMany: {},
          create: data.weightBrackets.map((w) => ({
            startKg: w.minKg,
            endKg: w.maxKg,
            price: w.rate,
          })),
        };
      }

      if (data.driverCommissions) {
        payload.driverCommissions = {
          deleteMany: {},
          create: data.driverCommissions.map((dc) => ({
            vehicleTypeId: dc.vehicleTypeId,
            fixed: dc.fixed ?? null,
            perKm: dc.perKm ?? null,
            percentage: dc.percentage ?? null,
          })),
        };
      }

      if (data.additionalCharges) {
        payload.miscCharges = {
          deleteMany: {},
          create: data.additionalCharges.costPerKm
            ? [
                {
                  name: 'cost_per_km',
                  flatFee: data.additionalCharges.costPerKm,
                },
              ]
            : [],
        };

        payload.profitMargin = data.additionalCharges.profitMargin
          ? {
              delete: {},
              create: { percentage: data.additionalCharges.profitMargin },
            }
          : undefined;
      }

      if (data.airportFee) {
        payload.airportFee = {
          delete: {},
          create: { amount: data.airportFee.price },
        };
      }

      // Remove undefined fields
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k],
      );

      const updated = await this.pricingRepo.updateTariff(id, payload);

      this.logger.log(`Tariff updated: ${id}`);

      return updated;
    } catch (err) {
      this.logger.error(`Failed to update tariff: ${err.message}`);
      throw err;
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
  // async createProfitMargin(data: ProfitMarginDto) {
  //   this.logger.log(`Creating profit margin for tariff: ${data.tariffId}`);
  //   try {
  //     // 1️⃣ Check tariff exists
  //     const tariff = await this.pricingRepo.findTariffById(data.tariffId);
  //     if (!tariff) {
  //       this.logger.warn(`Tariff not found: ${data.tariffId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: 'Tariff not found',
  //       });
  //     }

  //     // 2️⃣ Validate min/max logic
  //     if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'minAmount cannot be greater than maxAmount',
  //       });
  //     }

  //     // 3️⃣ Validate percentage
  //     if (data.percentage < 0 || data.percentage > 100) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'percentage must be between 0 and 100',
  //       });
  //     }

  //     // 4️⃣ Ensure no existing profit margin for this tariff
  //     const exists = await this.pricingRepo.findByTariffId(data.tariffId);
  //     if (exists) {
  //       throw new RpcException({
  //         statusCode: 409,
  //         message: 'Profit margin already exists for this tariff',
  //       });
  //     }

  //     // ✅ Create
  //     const created = await this.pricingRepo.createProfitMargin(data);
  //     this.logger.log(
  //       `Profit margin created successfully for tariff: ${data.tariffId}`,
  //     );
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create profit margin: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findAllProfitMargins(query: ListQueryDto) {
  //   this.logger.log('Fetching all profit margins');
  //   try {
  //     return await this.pricingRepo.findAll(query);
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch profit margins: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findProfitMarginById(id: string) {
  //   this.logger.log(`Fetching profit margin by ID: ${id}`);
  //   try {
  //     const pm = await this.pricingRepo.findProfitMarginById(id);
  //     if (!pm)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: 'Profit margin not found',
  //       });
  //     return pm;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to fetch profit margin ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // async updateProfitMargin(id: string, data: UpdateProfitMarginDto) {
  //   this.logger.log(`Updating profit margin ID: ${id}`);
  //   try {
  //     const pm = await this.pricingRepo.findProfitMarginById(id);
  //     if (!pm)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: 'Profit margin not found',
  //       });

  //     // Validate min/max if both present
  //     if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'minAmount cannot be greater than maxAmount',
  //       });
  //     }

  //     if (data.percentage && (data.percentage < 0 || data.percentage > 100)) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'percentage must be between 0 and 100',
  //       });
  //     }

  //     const updated = await this.pricingRepo.updateProfitMargin(id, data);
  //     this.logger.log(`Profit margin updated successfully: ${id}`);
  //     return updated;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to update profit margin ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // async deleteProfitMargin(id: string) {
  //   this.logger.log(`Deleting profit margin ID: ${id}`);
  //   try {
  //     const pm = await this.pricingRepo.findProfitMarginById(id);
  //     if (!pm)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: 'Profit margin not found',
  //       });

  //     const deleted = await this.pricingRepo.deleteProfitMargin(id);
  //     this.logger.log(`Profit margin deleted successfully: ${id}`);
  //     return deleted;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to delete profit margin ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // //==================================================================================================================AIRPORT FEES==============================================================================================================================
  // async createAirportFee(data: AirportFeeDto) {
  //   this.logger.log(`Creating airport fee for tariff: ${data.tariffId}`);
  //   try {
  //     // 1️⃣ Check Tariff exists
  //     const tariff = await this.pricingRepo.findTariffById(data.tariffId);
  //     if (!tariff) {
  //       this.logger.warn(`Tariff not found: ${data.tariffId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Tariff with id ${data.tariffId} does not exist`,
  //       });
  //     }

  //     // 2️⃣ Validate fee type
  //     if (!data.perKgRate && !data.flatFee) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'Either perKgRate or flatFee must be provided',
  //       });
  //     }

  //     // 3️⃣ Validate dates
  //     const from = new Date(data.effectiveFrom);
  //     const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
  //     if (to && from >= to) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'effectiveFrom must be earlier than effectiveTo',
  //       });
  //     }

  //     // 4️⃣ Check for duplicate/overlap
  //     const overlap = await this.pricingRepo.findOverlappingAirportFee(
  //       data,
  //       from,
  //       to,
  //     );
  //     if (overlap) {
  //       throw new RpcException({
  //         statusCode: 409,
  //         message: `Overlapping airport fee already exists for ${data.airportCode} (${data.serviceType}) in this tariff`,
  //       });
  //     }

  //     // 5️⃣ Save
  //     const created = await this.pricingRepo.createAirportFee(data);
  //     this.logger.log(
  //       `Airport fee created successfully for tariff: ${data.tariffId}`,
  //     );
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create airport fee: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findAllAirportFees(query: ListQueryDto) {
  //   this.logger.log('Fetching all airport fees');
  //   try {
  //     return await this.pricingRepo.findAllAirportFees(query);
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch airport fees: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findAirportFeeById(id: string) {
  //   this.logger.log(`Fetching airport fee by ID: ${id}`);
  //   try {
  //     const fee = await this.pricingRepo.findAirportFeeById(id);
  //     if (!fee)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `AirportFee with id ${id} not found`,
  //       });
  //     return fee;
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch airport fee ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>) {
  //   this.logger.log(`Updating airport fee ID: ${id}`);
  //   try {
  //     if (data.effectiveFrom && data.effectiveTo) {
  //       const from = new Date(data.effectiveFrom);
  //       const to = new Date(data.effectiveTo);
  //       if (from >= to) {
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'effectiveFrom must be earlier than effectiveTo',
  //         });
  //       }
  //     }
  //     const updated = await this.pricingRepo.updateAirportFee(id, data);
  //     this.logger.log(`Airport fee updated successfully: ${id}`);
  //     return updated;
  //   } catch (error) {
  //     this.logger.error(`Failed to update airport fee ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async deleteAirportFee(id: string) {
  //   this.logger.log(`Deleting airport fee ID: ${id}`);
  //   try {
  //     const deleted = await this.pricingRepo.deleteAirportFee(id);
  //     this.logger.log(`Airport fee deleted successfully: ${id}`);
  //     return deleted;
  //   } catch (error) {
  //     this.logger.error(`Failed to delete airport fee ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // //==================================================================================================================MISCELLANEOUS FEES==============================================================================================================================

  // async createMiscFee(data: MiscellaneousFeeDto) {
  //   this.logger.log(`Creating miscellaneous fee for tariff: ${data.tariffId}`);
  //   try {
  //     // 1️⃣ Check tariff exists
  //     const tariff = await this.pricingRepo.findTariffById(data.tariffId);
  //     if (!tariff) {
  //       this.logger.warn(`Tariff not found: ${data.tariffId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Tariff with id ${data.tariffId} does not exist`,
  //       });
  //     }

  //     // 2️⃣ Amount validations
  //     if (data.amount <= 0) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'Amount must be greater than 0',
  //       });
  //     }
  //     if (
  //       data.feeType === FeeType.PERCENTAGE &&
  //       (data.amount <= 0 || data.amount > 100)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'Percentage fee must be between 0 and 100',
  //       });
  //     }

  //     // 3️⃣ Date validations
  //     const from = new Date(data.effectiveFrom);
  //     const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
  //     if (to && from >= to) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: 'effectiveFrom must be earlier than effectiveTo',
  //       });
  //     }

  //     // 4️⃣ Save
  //     const created = await this.pricingRepo.createMiscFee(data);
  //     this.logger.log(
  //       `Miscellaneous fee created successfully for tariff: ${data.tariffId}`,
  //     );
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create miscellaneous fee: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findAllMiscFees(query: ListQueryDto) {
  //   this.logger.log('Fetching all miscellaneous fees');
  //   try {
  //     return await this.pricingRepo.findAllMiscFees(query);
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch miscellaneous fees: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findMiscFeeById(id: string) {
  //   this.logger.log(`Fetching miscellaneous fee by ID: ${id}`);
  //   try {
  //     const fee = await this.pricingRepo.findMiscFeeById(id);
  //     if (!fee)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `MiscFee with id ${id} not found`,
  //       });
  //     return fee;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to fetch miscellaneous fee ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // async updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>) {
  //   this.logger.log(`Updating miscellaneous fee ID: ${id}`);
  //   try {
  //     // Validate amount if provided
  //     if (data.amount !== undefined) {
  //       if (data.amount <= 0)
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'Amount must be greater than 0',
  //         });
  //       if (
  //         data.feeType === FeeType.PERCENTAGE &&
  //         (data.amount <= 0 || data.amount > 100)
  //       ) {
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'Percentage fee must be between 0 and 100',
  //         });
  //       }
  //     }
  //     // Validate dates if provided
  //     if (data.effectiveFrom && data.effectiveTo) {
  //       const from = new Date(data.effectiveFrom);
  //       const to = new Date(data.effectiveTo);
  //       if (from >= to)
  //         throw new RpcException({
  //           statusCode: 400,
  //           message: 'effectiveFrom must be earlier than effectiveTo',
  //         });
  //     }

  //     const updated = await this.pricingRepo.updateMiscFee(id, data);
  //     this.logger.log(`Miscellaneous fee updated successfully: ${id}`);
  //     return updated;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to update miscellaneous fee ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // async deleteMiscFee(id: string) {
  //   this.logger.log(`Deleting miscellaneous fee ID: ${id}`);
  //   try {
  //     const deleted = await this.pricingRepo.deleteMiscFee(id);
  //     this.logger.log(`Miscellaneous fee deleted successfully: ${id}`);
  //     return deleted;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to delete miscellaneous fee ${id}: ${error.message}`,
  //     );
  //     throw handleCatch(error);
  //   }
  // }

  // //===========================================================================================================================SURCHARGE==============================================================================================================================

  // // ── CREATE ──
  // async createSurcharge(data: SurchargeDto) {
  //   this.logger.log(`Creating surcharge for tariff: ${data.tariffId}`);
  //   try {
  //     // 1️⃣ Validate tariff existence
  //     const tariff = await this.pricingRepo.findTariffById(data.tariffId);
  //     if (!tariff) {
  //       this.logger.warn(`Tariff not found: ${data.tariffId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Tariff with id ${data.tariffId} not found`,
  //       });
  //     }

  //     // 2️⃣ Validate type
  //     if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
  //       });
  //     }

  //     // 3️⃣ Validate value
  //     if (data.value < 0) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Surcharge value cannot be negative`,
  //       });
  //     }

  //     // 4️⃣ Optional: validate serviceType
  //     if (
  //       data.serviceType &&
  //       !Object.values(ServiceType).includes(data.serviceType)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid serviceType "${data.serviceType}"`,
  //       });
  //     }

  //     // 5️⃣ Optional: validate shippingScope
  //     if (
  //       data.shippingScope &&
  //       !Object.values(ShippingScope).includes(data.shippingScope)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid shippingScope "${data.shippingScope}"`,
  //       });
  //     }

  //     const created = await this.pricingRepo.createSurcharge(data);
  //     this.logger.log(
  //       `Surcharge created successfully for tariff: ${data.tariffId}`,
  //     );
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create surcharge: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async updateSurcharge(id: string, data: Partial<UpdateSurchargeDto>) {
  //   this.logger.log(`Updating surcharge ID: ${id}`);
  //   try {
  //     const existing = await this.pricingRepo.findSurchargeById(id);
  //     if (!existing)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Surcharge with id ${id} not found`,
  //       });

  //     if (
  //       data.type &&
  //       !['percentage', 'fixed'].includes(data.type.toLowerCase())
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
  //       });
  //     }
  //     if (data.value !== undefined && data.value < 0) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Surcharge value cannot be negative`,
  //       });
  //     }
  //     if (
  //       data.serviceType &&
  //       !Object.values(ServiceType).includes(data.serviceType)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid serviceType "${data.serviceType}"`,
  //       });
  //     }
  //     if (
  //       data.shippingScope &&
  //       !Object.values(ShippingScope).includes(data.shippingScope)
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid shippingScope "${data.shippingScope}"`,
  //       });
  //     }

  //     const updated = await this.pricingRepo.updateSurcharge(id, data);
  //     this.logger.log(`Surcharge updated successfully: ${id}`);
  //     return updated;
  //   } catch (error) {
  //     this.logger.error(`Failed to update surcharge ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findAllSurcharge(query: ListQueryDto) {
  //   this.logger.log('Fetching all surcharges');
  //   try {
  //     return await this.pricingRepo.findAllSurcharge(query);
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch surcharges: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async findSurchargeById(id: string) {
  //   this.logger.log(`Fetching surcharge by ID: ${id}`);
  //   try {
  //     const surcharge = await this.pricingRepo.findSurchargeById(id);
  //     if (!surcharge)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Surcharge with id ${id} not found`,
  //       });
  //     return surcharge;
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch surcharge ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // async deleteSurcharge(id: string) {
  //   this.logger.log(`Deleting surcharge ID: ${id}`);
  //   try {
  //     const existing = await this.pricingRepo.findSurchargeById(id);
  //     if (!existing)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Surcharge with id ${id} not found`,
  //       });

  //     const deleted = await this.pricingRepo.deleteSurcharge(id);
  //     this.logger.log(`Surcharge deleted successfully: ${id}`);
  //     return deleted;
  //   } catch (error) {
  //     this.logger.error(`Failed to delete surcharge ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // //============================================================================================================================================DISCOUNT================================================================================================================================

  // // ── CREATE ──
  // async createDiscount(data: DiscountDto) {
  //   this.logger.log(`Creating discount for tariff: ${data.tariffId}`);
  //   try {
  //     // 1️⃣ Validate tariff
  //     const tariff = await this.pricingRepo.findTariffById(data.tariffId);
  //     if (!tariff) {
  //       this.logger.warn(`Tariff not found: ${data.tariffId}`);
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Tariff with id ${data.tariffId} not found`,
  //       });
  //     }

  //     // 2️⃣ Validate type
  //     if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid type "${data.type}". Allowed: percentage or fixed`,
  //       });
  //     }

  //     // 3️⃣ Validate value
  //     if (data.value < 0) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Discount value cannot be negative`,
  //       });
  //     }

  //     // 4️⃣ Validate customer category (optional)
  //     if (data.customerCategoryId) {
  //       const category = await this.pricingRepo.findCustomerCategoryById(
  //         data.customerCategoryId,
  //       );
  //       if (!category) {
  //         throw new RpcException({
  //           statusCode: 404,
  //           message: `Customer category not found`,
  //         });
  //       }
  //     }

  //     // 5️⃣ Validate dates
  //     const validFrom = new Date(data.validFrom);
  //     const validTo = data.validTo ? new Date(data.validTo) : null;
  //     if (validTo && validFrom > validTo) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `validFrom cannot be after validTo`,
  //       });
  //     }

  //     const created = await this.pricingRepo.createDiscount({
  //       ...data,
  //       validFrom,
  //       validTo,
  //     });
  //     this.logger.log(
  //       `Discount created successfully for tariff: ${data.tariffId}`,
  //     );
  //     return created;
  //   } catch (error) {
  //     this.logger.error(`Failed to create discount: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // // ── UPDATE ──
  // async updateDiscount(id: string, data: Partial<UpdateDiscountDto>) {
  //   this.logger.log(`Updating discount ID: ${id}`);
  //   try {
  //     const existing = await this.pricingRepo.findDiscountById(id);
  //     if (!existing)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Discount with id ${id} not found`,
  //       });

  //     if (
  //       data.type &&
  //       !['percentage', 'fixed'].includes(data.type.toLowerCase())
  //     ) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Invalid type "${data.type}"`,
  //       });
  //     }

  //     if (data.value !== undefined && data.value < 0) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `Discount value cannot be negative`,
  //       });
  //     }

  //     if (data.customerCategoryId) {
  //       const category = await this.pricingRepo.findCustomerCategoryById(
  //         data.customerCategoryId,
  //       );
  //       if (!category)
  //         throw new RpcException({
  //           statusCode: 404,
  //           message: `Customer category not found`,
  //         });
  //     }

  //     // Date parsing & validation
  //     const validFrom = data.validFrom ? new Date(data.validFrom) : undefined;
  //     const validTo = data.validTo ? new Date(data.validTo) : undefined;
  //     if (validFrom && validTo && validFrom > validTo) {
  //       throw new RpcException({
  //         statusCode: 400,
  //         message: `validFrom cannot be after validTo`,
  //       });
  //     }

  //     const updated = await this.pricingRepo.updateDiscount(
  //       id,
  //       { ...data },
  //       validFrom,
  //       validTo,
  //     );
  //     this.logger.log(`Discount updated successfully: ${id}`);
  //     return updated;
  //   } catch (error) {
  //     this.logger.error(`Failed to update discount ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // // ── GET ALL ──
  // async findAllDiscount(query: ListQueryDto) {
  //   this.logger.log('Fetching all discounts');
  //   try {
  //     return await this.pricingRepo.findAllDiscount(query);
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch discounts: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // // ── GET BY ID ──
  // async findDiscountById(id: string) {
  //   this.logger.log(`Fetching discount by ID: ${id}`);
  //   try {
  //     const discount = await this.pricingRepo.findDiscountById(id);
  //     if (!discount)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Discount with id ${id} not found`,
  //       });
  //     return discount;
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch discount ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

  // // ── DELETE ──
  // async deleteDiscount(id: string) {
  //   this.logger.log(`Deleting discount ID: ${id}`);
  //   try {
  //     const existing = await this.pricingRepo.findDiscountById(id);
  //     if (!existing)
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: `Discount with id ${id} not found`,
  //       });

  //     const deleted = await this.pricingRepo.deleteDiscount(id);
  //     this.logger.log(`Discount deleted successfully: ${id}`);
  //     return deleted;
  //   } catch (error) {
  //     this.logger.error(`Failed to delete discount ${id}: ${error.message}`);
  //     throw handleCatch(error);
  //   }
  // }

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

  // async calculatePrice(orderId: string, userId?: string) {
  //   this.logger.log(
  //     `🔹 Calculating price for Order ID: ${orderId}, User ID: ${userId || 'N/A'}`,
  //   );

  //   // 1️⃣ Fetch order & customer concurrently
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
  //     `🔹 Order found: ${order.id}, Customer: ${order.customer?.name || 'N/A'}`,
  //   );

  //   // 2️⃣ Fetch customer category if available
  //   const category = customer?.customerCategoryId
  //     ? await this.pricingRepo.findCustomerCategoryById(
  //         customer.customerCategoryId,
  //       )
  //     : null;

  //   if (category)
  //     this.logger.log(
  //       `🔹 Customer Category: ${category.name} (${category.id})`,
  //     );

  //   // 3️⃣ Fetch applicable tariff
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

  //   const weight = order.weight || 0;
  //   const distance = order.distance || 0;
  //   const breakdown: any = {};

  //   // 4️⃣ Base price calculation
  //   const basePrice =
  //     (tariff.baseFee || 0) +
  //     (tariff.perKgRate || 0) * weight +
  //     (tariff.perKmRate || 0) * distance;
  //   breakdown.basePrice = basePrice;

  //   // 5️⃣ Calculate misc fees
  //   const [miscTotal, miscFees] = this.calculateMiscFees(
  //     tariff.miscFees || [],
  //     order,
  //     basePrice,
  //     weight,
  //     distance,
  //   );

  //   // 6️⃣ Calculate airport fees
  //   const [airportTotal, airportFees] = this.calculateAirportFees(
  //     tariff.airportFees || [],
  //     order,
  //     weight,
  //   );

  //   // 7️⃣ Calculate surcharges
  //   const [surchargeTotal, surcharges] = this.calculateSurcharges(
  //     tariff.surcharges || [],
  //     order,
  //     basePrice,
  //     miscTotal,
  //     airportTotal,
  //   );

  //   // 8️⃣ Calculate discounts
  //   const [discountTotal, discounts] = category
  //     ? await this.calculateDiscounts(
  //         tariff.id,
  //         category.id,
  //         basePrice,
  //         miscTotal,
  //         airportTotal,
  //         surchargeTotal,
  //       )
  //     : [0, []];

  //   // 9️⃣ Calculate profit margins
  //   const [profitTotal, profitMargins] = this.calculateProfitMargins(
  //     tariff.profitMargins || [],
  //     order,
  //     basePrice,
  //     miscTotal,
  //     airportTotal,
  //     surchargeTotal,
  //     discountTotal,
  //   );

  //   // 🔟 Final price BEFORE commission
  //   const finalPriceWithoutCommission =
  //     basePrice +
  //     miscTotal +
  //     airportTotal +
  //     surchargeTotal -
  //     discountTotal +
  //     profitTotal;

  //   breakdown.finalPriceWithoutCommission = finalPriceWithoutCommission;

  //   // 1️⃣1️⃣ Fetch all active vehicle commissions
  //   const commissions = await this.pricingRepo.getAllActiveVehicleCommissions();

  //   // Safety check
  //   if (!commissions || commissions.length === 0) {
  //     this.logger.warn('⚠️ No active commissions found. Using 0 commission.');
  //     breakdown.driverCommission = 0;
  //   } else {
  //     // Convert all commissions to ETB amounts
  //     const commissionAmounts = commissions.map((c) => {
  //       if (c.commissionType === 'PERCENTAGE') {
  //         return (c.value / 100) * finalPriceWithoutCommission;
  //       }
  //       return c.value; // FIXED ETB
  //     });

  //     const totalCommission = commissionAmounts.reduce((a, b) => a + b, 0);
  //     const avgCommission = totalCommission / commissionAmounts.length;

  //     // Calculate 40% cap
  //     const commissionCap = finalPriceWithoutCommission * 0.4;

  //     // Apply your rule
  //     const appliedCommission =
  //       totalCommission > commissionCap ? commissionCap : avgCommission;

  //     breakdown.driverCommission = appliedCommission;

  //     // Add commission to final price
  //     breakdown.finalPrice = finalPriceWithoutCommission + appliedCommission;
  //   }

  //   const finalPrice = breakdown.finalPrice;

  //   breakdown.finalPrice = finalPrice;
  //   breakdown.miscFees = miscFees;
  //   breakdown.airportFees = airportFees;
  //   breakdown.surcharges = surcharges;
  //   breakdown.discounts = discounts;
  //   breakdown.profitMargins = profitMargins;

  //   this.logger.log('🔹 Price breakdown:', JSON.stringify(breakdown, null, 2));

  //   // 1️⃣1️⃣ Save calculation & update order in background
  //   await this.pricingRepo.logPriceCalculationAndUpdateOrder({
  //     orderId: order.id,
  //     weight,
  //     distance,
  //     baseRate: basePrice,
  //     appliedRate: basePrice + miscTotal + airportTotal + surchargeTotal,
  //     surcharges,
  //     discounts,
  //     miscFees,
  //     profit: { total: profitTotal },
  //     airportFee: { total: airportTotal },
  //     finalPrice,
  //     currency: tariff.currency || 'ETB',
  //     tariffId: tariff.id,
  //   });

  //   return {
  //     result: {
  //       finalPrice,
  //       currency: tariff.currency || 'ETB',
  //       breakdown,
  //     },
  //     error: null,
  //   };
  // }

  async calculatePriceFromDtoV2(dto: CreateOrderDto) {
    this.logger.log(
      `🔹 Calculating price from DTO for customer ${dto.customerId || 'N/A'}`,
    );

    // Extract needed fields
    const {
      customerId,
      weight: dtoWeight,
      serviceType,
      shippingScope,
      branchId,
      pickupAddress,
      deliveryAddress,
    } = dto as any;

    const weight = dtoWeight || 0;

    // 1️⃣ Load customer + category (same as your current DTO method)
    const [customer] = await Promise.all([
      customerId
        ? this.pricingRepo.findCustomerById(customerId)
        : Promise.resolve(null),
    ]);

    const category = customer?.customerCategoryId
      ? await this.pricingRepo.findCustomerCategoryById(
          customer.customerCategoryId,
        )
      : null;

    // 2️⃣ Fetch active tariff group (MUST MATCH calculatePrice(orderId))
    const tariff = await this.pricingRepo.findTariffByScopeAndServiceType(
      shippingScope,
      serviceType,
    );

    if (!tariff) {
      return {
        result: null,
        error: `No active tariff group found for ${shippingScope}/${serviceType}`,
      };
    }

    // --------------------------------------------------------------------
    // 3️⃣ Calculate Distance (DTO logic stays same)
    // --------------------------------------------------------------------

    let pickupCoord: { lat: number; lon: number } | null = null;
    let deliveryCoord: { lat: number; lon: number } | null = null;

    if (pickupAddress?.lat != null && pickupAddress?.long != null) {
      pickupCoord = {
        lat: Number(pickupAddress.lat),
        lon: Number(pickupAddress.long),
      };
    } else if (branchId) {
      const branch = await this.pricingRepo.findBranchById(branchId);
      if (branch?.address?.lat != null && branch?.address?.long != null) {
        pickupCoord = {
          lat: Number(branch.address.lat),
          lon: Number(branch.address.long),
        };
      }
    }

    if (deliveryAddress?.lat != null && deliveryAddress?.long != null) {
      deliveryCoord = {
        lat: Number(deliveryAddress.lat),
        lon: Number(deliveryAddress.long),
      };
    }

    const distance = await this.mapsService.calculateDistance(
      pickupCoord || { lat: 0, lon: 0 },
      deliveryCoord || { lat: 0, lon: 0 },
    );

    // --------------------------------------------------------------------
    // 4️⃣ PRICE CALCULATION (EXACT LOGIC COPIED FROM calculatePrice(orderId))
    // --------------------------------------------------------------------

    const breakdown: any = {};

    // 4.1 Base Fee (TariffServiceType match)
    const service = tariff.serviceTypes.find(
      (s) => s.serviceType === serviceType,
    );
    if (!service)
      return { result: null, error: 'No serviceType pricing in tariff' };

    breakdown.baseFee = service.baseFee;

    // 4.2 Weight Bucket Fee
    const bucket = tariff.weightBuckets.find(
      (b) => weight >= b.startKg && weight <= b.endKg,
    );
    if (!bucket)
      return { result: null, error: 'No weight bucket found in tariff' };

    breakdown.weightPrice = bucket.price;

    // 4.3 Misc Charges
    let miscTotal = 0;
    breakdown.miscFees = [];

    for (const m of tariff.miscCharges) {
      let amount = 0;
      if (m.costPerKm) amount += m.costPerKm * distance;
      if (m.flatFee) amount += m.flatFee;

      miscTotal += amount;
      breakdown.miscFees.push({ name: m.name, amount });
    }

    // 4.4 Airport Fee
    const airportTotal = tariff.airportFee?.amount ?? 0;
    breakdown.airportFee = { total: airportTotal };

    // 4.5 Profit Margin
    const subtotalBeforeProfit =
      service.baseFee + bucket.price + miscTotal + airportTotal;

    const profitTotal = tariff.profitMargin
      ? (subtotalBeforeProfit * tariff.profitMargin.percentage) / 100
      : 0;

    breakdown.profit = { total: profitTotal };

    // 4.6 Driver Commissions
    let commissionAmount = 0;

    if (tariff.driverCommissions.length > 0) {
      let totalCommission = 0;

      for (const c of tariff.driverCommissions) {
        let amount = 0;
        if (c.fixed) amount += c.fixed;
        if (c.perKm) amount += c.perKm * distance;
        if (c.percentage)
          amount += ((subtotalBeforeProfit + profitTotal) * c.percentage) / 100;

        totalCommission += amount;
      }

      commissionAmount = totalCommission / tariff.driverCommissions.length;
    }

    breakdown.driverCommission = commissionAmount;

    // 4.7 FINAL PRICE
    const finalPrice = subtotalBeforeProfit + profitTotal + commissionAmount;

    breakdown.finalPrice = finalPrice;

    // --------------------------------------------------------------------
    // 5️⃣ Return identical structure as the DB version
    // --------------------------------------------------------------------

    return {
      result: {
        finalPrice,
        currency: tariff.currency,
        breakdown,
      },
      error: null,
    };
  }

  //===========================================================HELPER METHODS===========================================================================================================

  /**
   * Calculate miscellaneous fees based on order conditions.
   */
  // private calculateMiscFees(
  //   fees: MiscFee[],
  //   order: OrderLike,
  //   basePrice: number,
  //   weight: number,
  //   distance: number,
  // ): [number, FeeBreakdown[]] {
  //   let total = 0;
  //   const list: FeeBreakdown[] = [];

  //   for (const fee of fees) {
  //     if (fee.serviceType && fee.serviceType !== order.serviceType) continue;

  //     let apply = true;
  //     if (fee.condition) {
  //       const condition = fee.condition as Record<string, any>;
  //       for (const [key, val] of Object.entries(condition)) {
  //         const orderVal = (order as any)[key];
  //         if (typeof val === 'object') {
  //           if (val.gte !== undefined && orderVal < val.gte) apply = false;
  //           if (val.lte !== undefined && orderVal > val.lte) apply = false;
  //         } else if (orderVal !== val) apply = false;
  //       }
  //     }
  //     if (!apply) continue;

  //     let amount = 0;
  //     switch (fee.feeType) {
  //       case 'PERCENTAGE':
  //         amount = (basePrice * fee.amount) / 100;
  //         break;
  //       case 'PER_KG':
  //         amount = fee.amount * weight;
  //         break;
  //       case 'PER_KM':
  //         amount = fee.amount * distance;
  //         break;
  //       default: // FLAT
  //         amount = fee.amount;
  //     }

  //     total += amount;
  //     list.push({ name: fee.name, amount });
  //   }

  //   return [total, list];
  // }

  // private calculateAirportFees(
  //   fees: AirportFee[],
  //   order: OrderLike,
  //   weight: number,
  // ): [number, FeeBreakdown[]] {
  //   let total = 0;
  //   const list: FeeBreakdown[] = [];

  //   for (const fee of fees) {
  //     if (!fee.serviceType || fee.serviceType === order.serviceType) {
  //       const amount = (fee.perKgRate ?? 0) * weight + (fee.flatFee ?? 0);
  //       total += amount;
  //       list.push({ airportCode: fee.airportCode, amount });
  //     }
  //   }

  //   return [total, list];
  // }

  // private calculateSurcharges(
  //   fees: SurchargeDto[],
  //   order: OrderLike,
  //   basePrice: number,
  //   miscTotal: number,
  //   airportTotal: number,
  // ): [number, FeeBreakdown[]] {
  //   let total = 0;
  //   const list: FeeBreakdown[] = [];

  //   for (const s of fees) {
  //     if (!s.isActive) continue;
  //     if (s.serviceType && s.serviceType !== order.serviceType) continue;

  //     const subtotal = basePrice + miscTotal + airportTotal;
  //     const amount =
  //       s.type === 'percentage' ? (subtotal * s.value) / 100 : s.value;

  //     total += amount;
  //     list.push({ name: s.name, amount });
  //   }

  //   return [total, list];
  // }

  // private async calculateDiscounts(
  //   tariffId: string,
  //   categoryId: string,
  //   basePrice: number,
  //   miscTotal: number,
  //   airportTotal: number,
  //   surchargeTotal: number,
  // ): Promise<[number, FeeBreakdown[]]> {
  //   const discounts = await this.pricingRepo.getDiscountRules(
  //     tariffId,
  //     categoryId,
  //   );
  //   let total = 0;
  //   const list: FeeBreakdown[] = [];

  //   for (const d of discounts as DiscountRule[]) {
  //     if (!d.isActive) continue;
  //     const subtotal = basePrice + miscTotal + airportTotal + surchargeTotal;
  //     const amount =
  //       d.type === 'percentage' ? (subtotal * d.value) / 100 : d.value;
  //     total += amount;
  //     list.push({ name: d.name, amount: -amount }); // Negative for discount
  //   }

  //   return [total, list];
  // }

  // private calculateProfitMargins(
  //   fees: ProfitMargin[],
  //   order: OrderLike,
  //   basePrice: number,
  //   miscTotal: number,
  //   airportTotal: number,
  //   surchargeTotal: number,
  //   discountTotal: number,
  // ): [number, FeeBreakdown[]] {
  //   let total = 0;
  //   const list: FeeBreakdown[] = [];

  //   for (const pm of fees) {
  //     if (pm.serviceType && pm.serviceType !== order.serviceType) continue;

  //     const subtotal =
  //       basePrice + miscTotal + airportTotal + surchargeTotal - discountTotal;
  //     let value = subtotal * (pm.percentage / 100);

  //     if (pm.minAmount && value < pm.minAmount) value = pm.minAmount;
  //     if (pm.maxAmount && value > pm.maxAmount) value = pm.maxAmount;

  //     total += value;
  //     list.push({ percentage: pm.percentage, amount: value });
  //   }

  //   return [total, list];
  // }

  async calculatePrice(orderId: string) {
    this.logger.log(`🔹 Calculating Price for Order: ${orderId}`);

    // 1️⃣ Load order with vehicleType and weight
    const order = await this.pricingRepo.getOrderById(orderId);

    if (!order) return { result: null, error: 'Order not found' };

    const weight = order.weight ?? 0;
    const distance = order.distance ?? 0;

    // 2️⃣ Load matching active tariff group
    const tariff = await this.pricingRepo.findTariffByScopeAndServiceType(
      order.shippingScope,
      order.serviceType,
    );

    if (!tariff) return { result: null, error: 'No active tariff group found' };

    const breakdown: any = {};

    // ------------------------------------------------------------
    // 3️⃣ Base fee (TariffServiceType)
    // ------------------------------------------------------------
    const service = tariff.serviceTypes.find(
      (s) => s.serviceType === order.serviceType,
    );
    if (!service)
      return { result: null, error: 'No serviceType pricing in tariff' };
    breakdown.baseFee = service.baseFee;

    // ------------------------------------------------------------
    // 4️⃣ Weight bucket price
    // ------------------------------------------------------------
    const bucket = tariff.weightBuckets.find(
      (b) => weight >= b.startKg && weight <= b.endKg,
    );
    if (!bucket)
      return { result: null, error: 'No weight bucket found in tariff' };
    breakdown.weightPrice = bucket.price;

    // ------------------------------------------------------------
    // 5️⃣ Misc charges
    // ------------------------------------------------------------
    let miscTotal = 0;
    breakdown.miscFees = [];
    for (const m of tariff.miscCharges) {
      let amount = 0;
      if (m.costPerKm) amount += m.costPerKm * distance;
      if (m.flatFee) amount += m.flatFee;

      miscTotal += amount;
      breakdown.miscFees.push({ name: m.name, amount });
    }

    // ------------------------------------------------------------
    // 6️⃣ Airport fee
    // ------------------------------------------------------------
    const airportTotal = tariff.airportFee?.amount ?? 0;
    breakdown.airportFee = { total: airportTotal };

    // ------------------------------------------------------------
    // 7️⃣ Profit margin
    // ------------------------------------------------------------
    const subtotalBeforeProfit =
      service.baseFee + bucket.price + miscTotal + airportTotal;
    const profitTotal = tariff.profitMargin
      ? (subtotalBeforeProfit * tariff.profitMargin.percentage) / 100
      : 0;
    breakdown.profit = { total: profitTotal };

    // ------------------------------------------------------------
    // 8️⃣ Driver commission (average of all commissions in tariff)
    // ------------------------------------------------------------
    let commissionAmount = 0;
    console.log('Driver COmmussion data ::: ', tariff.driverCommissions);

    if (tariff.driverCommissions.length > 0) {
      let totalCommission = 0;
      for (const c of tariff.driverCommissions) {
        let amount = 0;
        if (c.fixed) amount += c.fixed;
        if (c.perKm) amount += c.perKm * distance;
        if (c.percentage)
          amount += ((subtotalBeforeProfit + profitTotal) * c.percentage) / 100;
        totalCommission += amount;
      }
      commissionAmount = totalCommission / tariff.driverCommissions.length;
    }
    breakdown.driverCommission = commissionAmount;
    console.log('Driver commission amount ::: ', commissionAmount);

    // ------------------------------------------------------------
    // 🔟 Final price
    // ------------------------------------------------------------
    const finalPrice = subtotalBeforeProfit + profitTotal + commissionAmount;
    const appliedRate = subtotalBeforeProfit + profitTotal; // price without commission
    breakdown.finalPrice = finalPrice;
    console.log('FInal Price ::: ', finalPrice);
    console.log(
      'Driver commission amount after rate is applied ::: ',
      appliedRate,
    );

    // ------------------------------------------------------------
    // 1️⃣1️⃣ Save price log and update order
    // ------------------------------------------------------------
    await this.pricingRepo.logPriceCalculationAndUpdateOrder({
      orderId,
      weight,
      distance,
      baseRate: service.baseFee,
      appliedRate,
      surcharges: [], // currently empty, implement if needed
      discounts: [], // currently empty, implement if needed
      miscFees: breakdown.miscFees,
      profit: { total: profitTotal },
      airportFee: { total: airportTotal },
      finalPrice,
      currency: tariff.currency,
      tariffId: tariff.id,
    });

    return {
      result: { finalPrice, currency: tariff.currency, breakdown },
      error: null,
    };
  }

  async addCommission(data: AddCommissionDto, userId: string) {
    try {
      // const vehicleCommission = await this.pricingRepo.findCommissionByVehicle(
      //   data.vehicleTypeId,
      // );

      // if (vehicleCommission) {
      //   throw new RpcException({
      //     statusCode: 400,
      //     message:
      //       'Commission is already exist for this Vehicle please update existing one.',
      //   });
      // }
      const Commission = await this.pricingRepo.addCommission(data, userId);
      if (!Commission) {
        throw new RpcException({
          statusCode: 500,
          message: 'Failed to add Vehicle commission',
        });
      } else {
        return Commission;
      }
    } catch (error) {
      throw handleCatch(error);
    }
  }

  async updateCommission(
    data: updateCommissionDto,
    id: string,
    userId: string,
  ) {
    try {
      const commission = await this.pricingRepo.findCommissionById(id);
      if (!commission)
        throw new RpcException({
          statusCode: 404,
          message: 'Vehicle commission not found',
        });
      const driverCommission = await this.pricingRepo.updateCommission(
        data,
        id,
        userId,
      );

      if (!driverCommission) {
        throw new RpcException({
          statusCode: 500,
          message: 'Failed to update Vehicle commission',
        });
      } else {
        return driverCommission;
      }
    } catch (error) {
      throw handleCatch(error);
    }
  }

  async findAllCommissions(query: ListQueryDto) {
    try {
      return await this.pricingRepo.findAllCommissions(query);
    } catch (error) {
      throw handleCatch(error);
    }
  }

  async findCommissionById(id: string) {
    try {
      return await this.pricingRepo.findCommissionById(id);
    } catch (error) {
      throw handleCatch(error);
    }
  }
  async deleteCommission(id: string, userId: string) {
    try {
      return await this.pricingRepo.deleteCommission(id, userId);
    } catch (error) {
      throw handleCatch(error);
    }
  }

  async hardDeleteCommission(id: string) {
    try {
      return await this.pricingRepo.hardDeleteCommission(id);
    } catch (error) {
      throw handleCatch(error);
    }
  }

  //   async getDriverEarning(query: ListQueryDto, userId: string) {
  //   try {
  //     // Fetch everything in parallel
  //     const [
  //       driver,
  //       orders,
  //       driverCommission,
  //       driverRouteSegment,
  //     ] = await Promise.all([
  //       this.pricingRepo.findCustomerById(userId),
  //       this.pricingRepo.getOrdersByDriverId(userId),
  //       this.pricingRepo.findDriversCommission(userId),
  //       this.pricingRepo.findDriveRouteSegment(userId),
  //     ]);

  //     if (!driver) {
  //       throw new RpcException({
  //         statusCode: 404,
  //         message: 'Driver not found',
  //       });
  //     }

  //     // Extract orderIds from orders
  //     const orderIds = orders.map((o) => o.id);

  //     // Fetch earnings with orderIds
  //     const earning = await this.pricingRepo.getDriverEarning(
  //       query,
  //       userId,
  //       orderIds,
  //     );

  //     return {
  //       driver,
  //       commission: driverCommission,
  //       routeSegments: driverRouteSegment,
  //       orders,
  //       ...earning,
  //     };
  //   } catch (error) {
  //     throw handleCatch(error);
  //   }
  // }

  // Calculate payout for a segment (per-km or % of order)
  private calculateSegmentPayout(segment: any, maxPercentage = 0.4) {
    const orderFinalPrice = segment.order.finalPrice || 0;
    const driverPercentage = 0.4; // 40% cap
    const perKmRate = orderFinalPrice / segment.order.distance || 0; // optional alternative

    // Base payout by % of order
    let payout = orderFinalPrice * driverPercentage;

    // Optional: check against per-km calculation
    const distancePayout = (segment.distanceKm || 0) * perKmRate;

    // Use the lesser of the two (ensures we do not overpay)
    payout = Math.min(payout, distancePayout);

    // Safety: max 40% of final price
    if (payout > orderFinalPrice * maxPercentage) {
      payout = orderFinalPrice * maxPercentage;
    }

    return payout;
  }

  // Generate driver payments for all unpaid segments
  // async generateDriverPayments(driverId: string) {
  //   const segments = await this.pricingRepo.getUnpaidSegments(driverId);

  //   if (!segments.length) {
  //     this.logger.log(`No unpaid segments found for driver ${driverId}`);
  //     return [];
  //   }

  //   const payments = segments.map(seg => ({
  //     driverId,
  //     orderId: seg.orderId,
  //     segmentId: seg.id,
  //     distanceKm: seg.actualDistanceKm,
  //     amount: this.calculateSegmentPayout(seg),
  //     currency: 'ETB',
  //     status: 'PENDING',
  //   }));

  //   await this.pricingRepo.createDriverPayments(payments);
  //   this.logger.log(`Created ${payments.length} driver payments for driver ${driverId}`);

  //   return payments;
  // }

  // // Pay driver
  // async payDriver(paymentId: string) {
  //   const existing = await this.pricingRepo.existsBySegment(paymentId);
  //   if (existing && existing.status === 'PAID') {
  //     throw new RpcException('Segment already paid');
  //   }

  //   return this.pricingRepo.markAsPaid(paymentId);
  // }

  // // Get total pending / completed payments
  // async getDriverPaymentSummary(driverId: string) {
  //   const payments = await this.pricingRepo.getDriverPayments(driverId);
  //   const pending = payments.filter(p => p.status === 'PENDING').reduce((a, b) => a + b.amount, 0);
  //   const paid = payments.filter(p => p.status === 'PAID').reduce((a, b) => a + b.amount, 0);

  //   return { pending, paid, totalSegments: payments.length };
  // }

  // async getDriverEarnings(driverId: string) {
  //   let totalEarning = 0;
  //   const segments = await this.pricingRepo.getPendingSegments(driverId);
  //   console.log('Segments :: ', segments);

  //   const vehicle = await this.pricingRepo.getVehicle(driverId);
  //   console.log('Vehicle :: ', vehicle);

  //   const commissions = await this.pricingRepo.getVehicleCommissions(
  //     vehicle.vehicleTypeId,
  //   );

  //   const percentageCommission = commissions.find(
  //     (c) => c.commissionType === 'PERCENTAGE',
  //   );

  //   // const driverSummary = {};
  //   let orderSegments = await this.pricingRepo.getOrdersSegments(
  //     segments.map((s) => s.orderId),
  //   );

  //   console.log('Order segments ::: ', orderSegments);

  //   // ----------------------------
  //   // Original driverSummary calculation commented
  //   // for (const seg of orderSegments) {
  //   //   if (!driverSummary[seg.driverId]) {
  //   //     driverSummary[seg.driverId] = {
  //   //       driverId: seg.driverId,
  //   //       totalDistance: 0,
  //   //       count: 0,
  //   //     };
  //   //   }

  //   //   driverSummary[seg.driverId].totalDistance += seg.actualDistanceKm ?? 0;
  //   //   driverSummary[seg.driverId].count += 1;
  //   // }

  //   // const result = Object.values(driverSummary);
  //   // console.log(
  //   //   'Values result after calculating drivers on the order segment :: ',
  //   //   result,
  //   // );

  //   // ----------------------------
  //   const orders = {};

  //   for (const seg of orderSegments) {
  //     if (!orders[seg.orderId]) {
  //       orders[seg.orderId] = {
  //         orderId: seg.orderId,
  //         totalDistance: 0,
  //         finalPrice: seg.order.finalPrice,
  //         status: seg.order.status,
  //         pickupConfirmed: seg.order.pickupConfirmed,
  //         dropoffConfirmed: seg.order.dropoffConfirmed,
  //         actualDeliveryAt: seg.order.actualDeliveryAt,
  //         fulfillmentType: seg.order.fulfillmentType,
  //         deliveryDriverId: seg.order.deliveryDriverId,
  //         pickupDriverId: seg.order.pickupDriverId,
  //         count: 0,
  //         driverIds: new Set(), // keep track of drivers per order
  //       };
  //     }

  //     orders[seg.orderId].totalDistance += seg.actualDistanceKm ?? 0;
  //     orders[seg.orderId].count += 1;
  //     orders[seg.orderId].driverIds.add(seg.driverId);
  //   }

  //   let orderResult = Object.values(orders);

  //   console.log(
  //     'Values result fro orders after calculating orders on the order segment :: ',
  //     orderResult,
  //   );

  //   // ----------------------------
  //   // Remove orders for this driver if driver cancelled (your rules)
  //   // After calculating orderResult
  //   type OrderResultType = {
  //     orderId: string;
  //     totalDistance: number;
  //     finalPrice: number;
  //     status: string;
  //     pickupConfirmed: boolean;
  //     dropoffConfirmed: boolean;
  //     actualDeliveryAt: Date | null;
  //     fulfillmentType: 'PICKUP' | 'DROPOFF';
  //     deliveryDriverId: string;
  //     pickupDriverId: string;
  //     count: number;
  //     driverIds?: Set<string>;
  //   };

  //   const filteredOrderResult: OrderResultType[] = [];
  //   let filteredOrderSegments = [...orderSegments]; // copy initially

  //   for (const order of orderResult as OrderResultType[]) {
  //     if (order.status !== 'CANCELED') {
  //       filteredOrderResult.push(order);
  //       continue;
  //     }

  //     const cancellationInfo = await this.pricingRepo.getOrderCancellationInfo(
  //       order.orderId,
  //     );

  //     // Driver canceled the order
  //     if (cancellationInfo.createdBy === driverId) {
  //       const pickupStillAssigned = order.pickupDriverId === driverId;
  //       const deliveryStillAssigned = order.deliveryDriverId === driverId;

  //       // Only remove if driver is no longer assigned (i.e., id removed)
  //       if (!pickupStillAssigned && !deliveryStillAssigned) {
  //         console.log(
  //           'Removing canceled order and segments for driver:',
  //           order.orderId,
  //         );

  //         // Remove all segments for this driver
  //         filteredOrderSegments = filteredOrderSegments.filter(
  //           (s) => s.orderId !== order.orderId || s.driverId !== driverId,
  //         );

  //         // Skip adding this order
  //         continue;
  //       }
  //     }

  //     // Keep the order otherwise
  //     filteredOrderResult.push(order);
  //   }

  //   console.log('Filtered orderResult:', filteredOrderResult);
  //   console.log('Filtered orderSegments:', filteredOrderSegments);

  //   // ----------------------------
  //   // Filter only completed jobs for earnings calculation
  //   // ----------------------------

  //   const fullyCompletedOrderResult: OrderResultType[] = [];
  //   let fullyCompletedSegments = [...filteredOrderSegments]; // copy initially

  //   for (const order of filteredOrderResult) {
  //     const isPickupDriver = order.pickupDriverId === driverId;
  //     const isDeliveryDriver = order.deliveryDriverId === driverId;
  //     const isBothDriver = isPickupDriver && isDeliveryDriver;

  //     let jobCompleted = false; // we will determine if the job is completed

  //     // Pickup fulfillment logic
  //     if (order.fulfillmentType === 'PICKUP') {
  //       if (isPickupDriver) {
  //         // Pickup driver completes job when both pickup and dropoff confirmed
  //         jobCompleted = order.pickupConfirmed && order.dropoffConfirmed;
  //       } else if (isBothDriver) {
  //         // Both driver completes job when status is DELIVERED or actualDeliveryAt is set
  //         jobCompleted =
  //           order.status === 'DELIVERED' || !!order.actualDeliveryAt;
  //       }
  //     }

  //     // Dropoff fulfillment logic
  //     if (order.fulfillmentType === 'DROPOFF') {
  //       if (isDeliveryDriver) {
  //         // Delivery driver completes job when status is DELIVERED or actualDeliveryAt is set
  //         jobCompleted =
  //           order.status === 'DELIVERED' || !!order.actualDeliveryAt;
  //       } else if (isBothDriver) {
  //         // Both driver completes job when status is DELIVERED or actualDeliveryAt is set
  //         jobCompleted =
  //           order.status === 'DELIVERED' || !!order.actualDeliveryAt;
  //       }
  //     }

  //     if (!jobCompleted) {
  //       console.log('Skipping incomplete job for driver:', order.orderId);
  //       // Remove segments for this driver for incomplete jobs
  //       fullyCompletedSegments = fullyCompletedSegments.filter(
  //         (s) => s.orderId !== order.orderId || s.driverId !== driverId,
  //       );
  //       continue; // skip adding this order to final completed result
  //     }

  //     // Keep the order if job is completed
  //     fullyCompletedOrderResult.push(order);
  //   }

  //   console.log(
  //     'Fully completed orders for driver:',
  //     fullyCompletedOrderResult,
  //   );
  //   console.log('Fully completed segments for driver:', fullyCompletedSegments);
  //   if(percentageCommission){

  //   }
  // }

  async getDriverEarnings(userId: string) {
    type OrderResultType = {
      orderId: string;
      totalDistance: number;
      finalPrice: number;
      status: string;
      pickupConfirmed: boolean;
      dropoffConfirmed: boolean;
      actualDeliveryAt: Date | null;
      fulfillmentType: 'PICKUP' | 'DROPOFF';
      deliveryDriverId: string;
      pickupDriverId: string;
      trackingCode: string;
      count: number;
      driverIds?: Set<string>;
      isPickupDriver?: boolean;
      isDeliveryDriver?: boolean;
      isBothDriver?: boolean;
    };

    let totalEarning = 0;

    // Fetch segments, vehicle, driver, driver payments in parallel
    const [segments, vehicle, driver, driverPayments] = await Promise.all([
      this.pricingRepo.getPendingSegments(userId),
      this.pricingRepo.getVehicle(userId),
      this.pricingRepo.getDriver(userId),
      this.pricingRepo.getDriverPayment(userId),
    ]);

    console.log('Segment ::: ', segments);
    console.log('vehicle ::: ', vehicle);
    console.log('driver ::: ', driver);
    console.log('driverPayments ::: ', driverPayments);

    const driverId = driver.id;

    if (vehicle === null) {
      throw new RpcException({
        code: 404,
        message: 'Vehicle not found for driver',
      });
    }
    // Fetch commissions and order segments in parallel
    const [commissions, orderSegments] = await Promise.all([
      this.pricingRepo.getVehicleCommissions(vehicle.vehicleTypeId),
      this.pricingRepo.getOrdersSegments(segments.map((s) => s.orderId)),
    ]);

    console.log('commissions ::: ', commissions);
    console.log('orderSegments ::: ', orderSegments);
    const percentageCommission = commissions.find((c) => c.percentage);
    const fixedCommission = commissions.find((c) => c.fixed);

    const perKmCommission = commissions.find((c) => c.perKm);

    console.log('percentageCommission ::: ', percentageCommission);
    console.log('fixedCommission ::: ', fixedCommission);
    console.log('perKmCommission ::: ', perKmCommission);

    // ----------------------------
    // Build orders from segments
    const orders: Record<string, OrderResultType> = {};
    const segmentsMap = new Map<string, typeof orderSegments>();

    for (const seg of orderSegments) {
      if (!orders[seg.orderId]) {
        orders[seg.orderId] = {
          orderId: seg.orderId,
          totalDistance: 0,
          finalPrice: seg.order.finalPrice,
          status: seg.order.status,
          pickupConfirmed: seg.order.pickupConfirmed,
          dropoffConfirmed: seg.order.dropoffConfirmed,
          actualDeliveryAt: seg.order.actualDeliveryAt,
          fulfillmentType: seg.order.fulfillmentType,
          deliveryDriverId: seg.order.deliveryDriverId,
          pickupDriverId: seg.order.pickupDriverId,
          trackingCode: seg.order.trackingCode,
          count: 0,
          driverIds: new Set(),
          isPickupDriver: seg.order.pickupDriverId === userId,
          isDeliveryDriver: seg.order.deliveryDriverId === userId,
        };
        orders[seg.orderId].isBothDriver =
          orders[seg.orderId].isPickupDriver &&
          orders[seg.orderId].isDeliveryDriver;
      }

      orders[seg.orderId].totalDistance += seg.actualDistanceKm ?? 0;
      orders[seg.orderId].count += 1;
      orders[seg.orderId].driverIds.add(seg.driverId);

      // Fill segments map for faster access later
      const key = `${seg.orderId}-${seg.driverId}`;
      if (!segmentsMap.has(key)) segmentsMap.set(key, []);
      segmentsMap.get(key)!.push(seg);
    }

    const orderResult = Object.values(orders);

    // ----------------------------
    // Fetch all cancellation info in bulk to avoid sequential DB calls
    const canceledOrderIds = orderResult
      .filter((o) => o.status === 'CANCELED')
      .map((o) => o.orderId);
    const cancellationInfos = canceledOrderIds.length
      ? await this.pricingRepo.getOrderCancellationInfoBulk(canceledOrderIds)
      : [];

    // ----------------------------
    // Remove canceled orders for driver if no longer assigned
    let filteredOrderSegments = [...orderSegments];
    const filteredOrderResult: OrderResultType[] = [];

    for (const order of orderResult) {
      if (order.status !== 'CANCELED') {
        filteredOrderResult.push(order);
        continue;
      }

      const cancellationInfo = cancellationInfos.find(
        (c) => c.orderId === order.orderId,
      );

      if (cancellationInfo?.createdBy === userId) {
        const pickupStillAssigned = order.pickupDriverId === userId;
        const deliveryStillAssigned = order.deliveryDriverId === userId;

        if (!pickupStillAssigned && !deliveryStillAssigned) {
          filteredOrderSegments = filteredOrderSegments.filter(
            (s) => s.orderId !== order.orderId || s.driverId !== userId,
          );
          continue;
        }
      }

      filteredOrderResult.push(order);
    }

    if (
      filteredOrderResult.length === 0 &&
      filteredOrderSegments.length === 0
    ) {
      let totalEarnings = 0,
        paidTotalEarnings = 0;

      for (const payment of driverPayments) {
        totalEarnings += payment.amount;
        if (payment.status === 'PAID') paidTotalEarnings += payment.amount;
      }

      const data = driverPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        distanceKm: payment.distanceKm,
        status: payment.status,
        currency: payment.currency,
        order: {
          trackingCode: payment.order?.trackingCode,
          id: payment.order?.id,
        },
      }));

      return { totalEarnings, paidTotalEarnings, data };
    }

    // ----------------------------
    // Filter fully completed orders
    const fullyCompletedOrderResult: OrderResultType[] = [];
    let fullyCompletedSegments = [...filteredOrderSegments];

    for (const order of filteredOrderResult) {
      const isPickupDriver = order.isPickupDriver!;
      const isDeliveryDriver = order.isDeliveryDriver!;
      const isBothDriver = order.isBothDriver!;

      let jobCompleted = false;

      if (order.fulfillmentType === 'PICKUP') {
        if (isPickupDriver)
          jobCompleted = order.pickupConfirmed && order.dropoffConfirmed;
        else if (isBothDriver)
          jobCompleted =
            order.status === 'DELIVERED' || !!order.actualDeliveryAt;
      }

      if (order.fulfillmentType === 'DROPOFF') {
        if (isDeliveryDriver)
          jobCompleted =
            order.status === 'DELIVERED' || !!order.actualDeliveryAt;
        else if (isBothDriver)
          jobCompleted =
            order.status === 'DELIVERED' || !!order.actualDeliveryAt;
      }

      if (!jobCompleted) {
        fullyCompletedSegments = fullyCompletedSegments.filter(
          (s) => s.orderId !== order.orderId || s.driverId !== userId,
        );
        continue;
      }

      fullyCompletedOrderResult.push(order);
    }

    // ----------------------------
    // Calculate earnings per order
    type DriverEarningPerOrder = {
      orderId: string;
      orderTrackingCode?: string;
      earningFromOrder: number;
      calculationDate: Date;
    };

    const earningsPerOrder: DriverEarningPerOrder[] = [];
    const paymentsToCreate: any[] = [];

    for (const order of fullyCompletedOrderResult) {
      const orderSegmentsForDriver =
        segmentsMap.get(`${order.orderId}-${userId}`) ?? [];
      if (!orderSegmentsForDriver.length) continue;

      let driverOrderEarning = 0;
      const totalDistance = orderSegmentsForDriver.reduce(
        (sum, seg) => sum + (seg.actualDistanceKm ?? 0),
        0,
      );

      // Percentage commission
      if (percentageCommission) {
        const totalOrderCommission =
          (order.finalPrice * percentageCommission.percentage) / 100;
        if (order.isPickupDriver!) driverOrderEarning += totalOrderCommission;
        if (order.isDeliveryDriver!) driverOrderEarning += totalOrderCommission;
      }

      // Fixed commission
      if (fixedCommission) {
        let alreadyPaid = false;

        // check payments belonging to this driver
        const orderPayment = driverPayments.find(
          (p) => p.order.id === order.orderId,
        );

        if (orderPayment) {
          // Case 1: Pickup driver logic
          if (
            order.isPickupDriver &&
            order.dropoffConfirmed // means job finished for pickup driver
          ) {
            alreadyPaid = true;
          }

          // Case 2: Delivery driver logic
          if (
            order.isDeliveryDriver &&
            (order.status === 'DELIVERED' || !!order.actualDeliveryAt)
          ) {
            alreadyPaid = true;
          }

          // Case 3: Both driver roles
          if (order.isBothDriver) {
            const pickupFinished = order.dropoffConfirmed;
            const deliveryFinished =
              order.status === 'DELIVERED' || !!order.actualDeliveryAt;

            if (pickupFinished || deliveryFinished) {
              alreadyPaid = true;
            }
          }
        }

        // If no payment exists matching the finished stage → apply fixed commission
        if (!alreadyPaid) {
          driverOrderEarning += fixedCommission.fixed;
        }
      }

      if (perKmCommission) {
        for (const seg of orderSegmentsForDriver) {
          driverOrderEarning +=
            perKmCommission.perKm * (seg.actualDistanceKm ?? 0);
        }
      }
      totalEarning += driverOrderEarning;

      // Add to bulk create array
      paymentsToCreate.push({
        orderId: order.orderId,
        amount: driverOrderEarning,
        distanceKm: totalDistance,
        segments: orderSegmentsForDriver,
      });

      earningsPerOrder.push({
        orderId: order.orderId,
        orderTrackingCode: order.trackingCode,
        earningFromOrder: driverOrderEarning,
        calculationDate: new Date(),
      });
    }

    // Batch create driver payments
    if (paymentsToCreate.length > 0) {
      await this.pricingRepo.createDriverPaymentsBulk(
        driverId,
        paymentsToCreate,
      );
    }

    // ----------------------------
    // Total and paid earnings
    let totalEarnings = 0,
      paidTotalEarnings = 0;

    for (const payment of await this.pricingRepo.getDriverPayment(userId)) {
      totalEarnings += payment.amount;
      if (payment.status === 'PAID') paidTotalEarnings += payment.amount;
    }

    const data = driverPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      distanceKm: payment.distanceKm,
      status: payment.status,
      currency: payment.currency,
      order: { trackingCode: payment.order?.trackingCode },
    }));

    return { totalEarnings, paidTotalEarnings, data };
  }
}

//  const removeForDriver = segsForDriver.some(() => {
//   const isPickupDriver = order.pickupDriverId === driverId;
//   console.log('Is driver pickup driver :: ', isPickupDriver);

//   const isDeliveryDriver = order.deliveryDriverId === driverId;
//   console.log('Is Driver deliver driver :: ', isDeliveryDriver);

//   const isBothDriver = isPickupDriver && isDeliveryDriver;
//   console.log('Is driver both driver :: ', isBothDriver);

//   let jobIncomplete = false;

//   // Pickup fulfillment logic
//   if (order.fulfillmentType === 'PICKUP') {
//     console.log('Inside PICKUP type');

//     if (isPickupDriver) {
//       console.log(
//         'For pickup type and pickup driver jobincomplete is :: ',
//         jobIncomplete,
//       );

//       jobIncomplete =
//         !order.pickupConfirmed || !order.dropoffConfirmed;
//       console.log(
//         'FOr pickup type and pickup driver after check up jobincomplete is ::: ',
//         jobIncomplete,
//       );
//     } else if (isBothDriver) {
//       console.log(
//         'For ELSE part and both driver jobincomplete is :: ',
//         jobIncomplete,
//       );

//       jobIncomplete =
//         order.status !== 'DELIVERED' && !order.actualDeliveryAt;
//       console.log(
//         'For ELSE part and both driver after check up jobincomplete is :: ',
//         jobIncomplete,
//       );
//     }
//   }

//   // Dropoff fulfillment logic
//   if (order.fulfillmentType === 'DROPOFF') {
//     console.log('Inside DROPOFF type');

//     if (isDeliveryDriver) {
//       console.log(
//         'For Dropoff type and driver delivery jobincomplete is ::: ',
//         jobIncomplete,
//       );

//       jobIncomplete =
//         !order.actualDeliveryAt && order.status !== 'DELIVERED';
//       console.log(
//         'For Dropoff type and driver delivery after checkup jobincomplete is ::: ',
//         jobIncomplete,
//       );
//     }
//   }
//   console.log('FInally jobincomplete ::: ', jobIncomplete);

//   return jobIncomplete;
// });
