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
      const sorted = [...data.weightBrackets].sort(
        (a, b) => a.startKg - b.startKg,
      );

      for (let i = 0; i < sorted.length; i++) {
        const w = sorted[i];

        if (w.startKg < 0 || w.endKg <= 0 || w.endKg < w.startKg) {
          throw new RpcException({
            statusCode: 400,
            message: `Invalid weight bracket: ${JSON.stringify(w)}`,
          });
        }

        if (i > 0 && w.startKg < sorted[i - 1].endKg) {
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
      // 2. VALIDATE AIRPORT FEES
      // ----------------------------------------------------
      if (data.airportFees?.length) {
        data.airportFees.forEach((af) => {
          if (!af.serviceType) {
            throw new RpcException({
              statusCode: 400,
              message: 'AirportFee.serviceType is required',
            });
          }

          if (!af.flatRatePerKg && (!af.brackets || af.brackets.length === 0)) {
            throw new RpcException({
              statusCode: 400,
              message: `Airport fee for ${af.serviceType} must have either flatRatePerKg or brackets`,
            });
          }

          // Bracket validation
          if (af.brackets?.length) {
            const sortedB = [...af.brackets].sort((a, b) => a.minKg - b.minKg);

            for (let i = 0; i < sortedB.length; i++) {
              const b = sortedB[i];

              if (b.minKg < 0 || b.maxKg <= 0 || b.maxKg < b.minKg) {
                throw new RpcException({
                  statusCode: 400,
                  message: `Invalid airport bracket: ${JSON.stringify(b)}`,
                });
              }

              if (i > 0 && b.minKg < sortedB[i - 1].maxKg) {
                throw new RpcException({
                  statusCode: 400,
                  message: `Overlapping airport fee bracket: ${JSON.stringify(b)}`,
                });
              }
            }
          }
        });
      }

      // ----------------------------------------------------
      // 3. BUILD PRISMA PAYLOAD
      // ----------------------------------------------------

      // Build payload for TariffGroup
      const payload: any = {
        name: data.name.trim(),
        shippingScope: data.shippingScope,
        currency: data.currency ?? 'ETB',
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        isActive: true,
        createdBy: userId,
        serviceTypes: {
          create: data.serviceTypes.map((s) => ({
            serviceType: s.serviceType,
            baseFee: s.baseFee,
          })),
        },
        weightBuckets: {
          create: data.weightBrackets.map((w) => ({
            startKg: w.startKg,
            endKg: w.endKg,
            price: w.price,
          })),
        },
        driverCommissions: {
          create: data.driverCommissions.map((dc) => ({
            vehicleTypeId: dc.vehicleTypeId,
            fixed: dc.fixed ?? null,
            perKm: dc.perKm ?? null,
            percentage: dc.percentage ?? null,
          })),
        },
        miscCharges: {
          create:
            data.additionalCharges?.costPerKm != null
              ? [
                  {
                    name: 'cost_per_km',
                    costPerKm: data.additionalCharges.costPerKm,
                  },
                ]
              : [],
        },
        profitMargin:
          data.additionalCharges?.profitMargin != null
            ? { create: { percentage: data.additionalCharges.profitMargin } }
            : undefined,
      };
      // Remove undefined
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

      this.logger.verbose(
        `Tariff creation payload :: ${JSON.stringify(payload)}`,
      );

      // 1️⃣ Create tariff group
      const tariff = await this.pricingRepo.createTariffGroup(payload);

      // 2️⃣ Create airport fees
      if (data.airportFees?.length) {
        for (const af of data.airportFees) {
          const serviceType = tariff.serviceTypes.find(
            (s) => s.serviceType === af.serviceType,
          );
          if (!serviceType) continue;

          await this.pricingRepo.createAirportNewFee(
            serviceType.id,
            af.flatRatePerKg,
            af.brackets,
          );
        }
      }

      // // ----------------------------------------------------
      // // 4. CREATE IN DB (transaction resolves serviceTypeId)
      // // ----------------------------------------------------

      // const created = await this.pricingRepo.createTariff(payload);

      this.logger.log(`Tariff created successfully: ${tariff.id}`);

      return tariff;
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

  async updateTariff(id: string, dto: UpdateTariffDto, userId: string) {
    // Fetch existing tariff
    const tariff = await this.pricingRepo.getTariffGroup(id);
    if (!tariff) {
      throw new RpcException({ statusCode: 404, message: 'Tariff not found' });
    }

    // -------------------------
    // Update basic tariff fields
    // -------------------------
    const basicData: any = {
      name: dto.name?.trim(),
      currency: dto.currency?.toUpperCase(),
      updatedAt: new Date(),
    };
    await this.pricingRepo.updateTariffGroup(id, basicData);

    // -------------------------
    // Service Types
    // -------------------------
    for (const s of dto.serviceTypes ?? []) {
      console.log('Service type');

      if (s.id) {
        console.log('Updating exisiting ::: ', s);

        await this.pricingRepo.updateServiceType(s.id, s);
      } else {
        console.log('creating new one :::', s);

        await this.pricingRepo.createServiceType({ ...s, tariffGroupId: id });
      }
    }

    // -------------------------
    // Weight Buckets
    // -------------------------
    for (const w of dto.weightBrackets ?? []) {
      if (w.id) {
        await this.pricingRepo.updateWeightBucket(w.id, w);
      } else {
        await this.pricingRepo.createWeightBucket({ ...w, tariffGroupId: id });
      }
    }

    // -------------------------
    // Driver Commissions
    // -------------------------
    for (const dc of dto.driverCommissions ?? []) {
      if (dc.id) {
        await this.pricingRepo.updateDriverCommission(dc.id, dc);
      } else {
        await this.pricingRepo.createDriverCommission({
          ...dc,
          tariffGroupId: id,
        });
      }
    }

    // -------------------------
    // Misc Charges
    // -------------------------
    if (dto.additionalCharges?.costPerKm != null) {
      const existing = tariff.miscCharges?.find(
        (c) => c.name === 'cost_per_km',
      );
      if (existing) {
        await this.pricingRepo.updateMiscCharge(existing.id, {
          costPerKm: dto.additionalCharges.costPerKm,
          name: 'cost_per_km',
        });
      } else {
        await this.pricingRepo.createMiscCharge({
          costPerKm: dto.additionalCharges.costPerKm,
          tariffId: id,
          name: 'cost_per_km',
        });
      }
    }

    // -------------------------
    // Profit Margin
    // -------------------------
    if (dto.additionalCharges?.profitMargin != null) {
      if (tariff.profitMargin) {
        await this.pricingRepo.updateProfitMargin(tariff.profitMargin.id, {
          percentage: dto.additionalCharges.profitMargin,
        });
      } else {
        await this.pricingRepo.createProfitMargin({
          percentage: dto.additionalCharges.profitMargin,
          tariffId: id,
        });
      }
    }
    // -------------------------
    // Airport fee
    // -------------------------
    for (const a of dto.airportFees ?? []) {
      if (a.id) {
        // Existing airport fee
        if (a.flatRatePerKg != null) {
          // Flat fee: update the main record
          await this.pricingRepo.updateAirportFee({
            id: a.id,
            flatRatePerKg: a.flatRatePerKg,
            tariffGroupId: id,
            serviceTypeId: a.serviceTypeId, // must be the related TariffServiceType ID
          });

          // Remove any existing brackets since flat fee is used
          await this.pricingRepo.deleteAirportFeeBracketsByFeeId(a.id);
        } else if (a.brackets?.length) {
          // Brackets exist: update main record (optional fields)
          await this.pricingRepo.updateAirportFee({
            id: a.id,
            flatRatePerKg: null,
            tariffGroupId: id,
            serviceTypeId: a.serviceTypeId,
          });

          // Handle brackets
          const bracketIds: string[] = [];
          for (const b of a.brackets) {
            let bracket;
            if (b.id) {
              // Existing bracket → upsert using id
              bracket = await this.pricingRepo.upsertAirportFeeBracket(
                { id: b.id },
                { ...b, airportFeeId: a.id },
                { ...b, airportFeeId: a.id },
              );
            } else {
              // New bracket → create
              bracket = await this.pricingRepo.createAirportFeeBracket({
                ...b,
                airportFeeId: a.id,
              });
            }

            bracketIds.push(bracket.id);
          }

          // Delete old brackets not in DTO
          await this.pricingRepo.deleteAirportFeeBracketsNotIn(
            a.id,
            bracketIds,
          );
        }
      } else {
        // New airport fee
        const fee = await this.pricingRepo.createAirportFee({
          flatRatePerKg: a.flatRatePerKg ?? null,
          // tariffGroupId: id,
          // serviceType: a.serviceTypeId ?? '',
          serviceTypeId: a.serviceTypeId ?? '', // must be the related TariffServiceType ID
        });

        if (a.brackets?.length) {
          for (const b of a.brackets) {
            await this.pricingRepo.createAirportFeeBracket({
              ...b,
              airportFeeId: fee.id,
            });
          }
        }
      }
    }

    // Return updated tariff
    return await this.pricingRepo.getTariffGroup(id);
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

  async calculatePriceFromDtoV2(dto: CreateOrderDto) {
    this.logger.log(
      `🔹 Calculating price from DTO for customer ${dto.customerId || 'N/A'}`,
    );

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

    // 1️⃣ Load customer + category
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

    // 2️⃣ Fetch active tariff group (with service types, weight buckets, misc, commissions, profit)
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
    // 3️⃣ Calculate Distance
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
    // 4️⃣ PRICE CALCULATION
    // --------------------------------------------------------------------
    const breakdown: any = {};

    // 4.1 Base Fee
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

    // 4.4 Airport Fee (NEW LOGIC)
    let airportTotal = 0;
    if (service.airportFee) {
      const airportFee = service.airportFee;

      if (airportFee.brackets && airportFee.brackets.length > 0) {
        // Find the bracket for the weight
        const bracket = airportFee.brackets.find(
          (b) => weight >= b.minKg && weight <= b.maxKg,
        );
        if (bracket) airportTotal = bracket.rate * weight;
      } else if (airportFee.flatRatePerKg) {
        airportTotal = airportFee.flatRatePerKg * weight;
      }
    }
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
    // 5️⃣ Return structure
    // --------------------------------------------------------------------
    return {
      result: { finalPrice, currency: tariff.currency, breakdown },
      error: null,
    };
  }

  //===========================================================HELPER METHODS===========================================================================================================

  async calculatePrice(orderId: string) {
    this.logger.log(`🔹 Calculating Price for Order: ${orderId}`);

    // 1️⃣ Load order with vehicleType and weight
    const order = await this.pricingRepo.getOrderById(orderId);
    if (!order) return { result: null, error: 'Order not found' };

    const weight = order.weight ?? 0;
    const distance = order.distance ?? 0;

    // 2️⃣ Load matching active tariff group (with serviceTypes, miscCharges, weightBuckets, driverCommissions, profitMargin)
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
    // 6️⃣ Airport fee (NEW LOGIC)
    // ------------------------------------------------------------
    let airportTotal = 0;
    if (service.airportFee) {
      const airportFee = service.airportFee;

      if (airportFee.brackets && airportFee.brackets.length > 0) {
        // Find bracket that matches the weight
        const bracket = airportFee.brackets.find(
          (b) => weight >= b.minKg && weight <= b.maxKg,
        );
        if (bracket) airportTotal = bracket.rate * weight;
      } else if (airportFee.flatRatePerKg) {
        airportTotal = airportFee.flatRatePerKg * weight;
      }
    }
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
    // 8️⃣ Driver commission
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // 9️⃣ Final price
    // ------------------------------------------------------------
    const finalPrice = subtotalBeforeProfit + profitTotal + commissionAmount;
    const appliedRate = subtotalBeforeProfit + profitTotal; // price without commission
    breakdown.finalPrice = finalPrice;

    // ------------------------------------------------------------
    // 🔟 Save price log and update order
    // ------------------------------------------------------------
    await this.pricingRepo.logPriceCalculationAndUpdateOrder({
      orderId,
      weight,
      distance,
      baseRate: service.baseFee,
      appliedRate,
      surcharges: [], // implement if needed
      discounts: [], // implement if needed
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
