import { Injectable } from '@nestjs/common';
import { OrderRouteSegment, ServiceType, ShippingScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddCommissionDto,
  AirportFeeDto,
  AirportFeesDto,
  CustomerCategoryDto,
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
  UpdateTariffDto,
} from './pricing.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PricingRepository {
  async getTariffById(id: string) {
    return this.prisma.tariffGroup.findUnique({
      where: { id },
      include: {
        serviceTypes: {
          include: { airportFee: { include: { brackets: true } } },
        },
        profitMargin: true,
        driverCommissions: true,
        miscCharges: true,
        weightBuckets: true,
      },
    });
  }
  async getActiveTariffsWithVehicleTypeCommission(vehicleTypeId: string) {
    return this.prisma.tariffGroup.findMany({
      where: {
        driverCommissions: {
          some: {
            vehicleTypeId: vehicleTypeId,
          },
        },
        isActive: true,
      },
      include: {
        driverCommissions: true,
      },
    });
  }
  async getAllActiveVehicleCommissions() {
    return this.prisma.vehicleCommission.findMany({
      where: {
        isActive: true,
      },
    });
  }
  async findCommissionByVehicle(vehicleTypeId: any) {
    return this.prisma.vehicleCommission.findFirst({
      where: {
        // vehicleTypeId: vehicleTypeId,
      },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
      },
    });
  }

  async findDriveRouteSegment(userId: string) {
    return this.prisma.orderRouteSegment.findMany({
      where: {
        driverId: userId,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        orderId: true,
        actualDistanceKm: true,
      },
    });
  }
  async getOrdersByDriverId(userId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          {
            pickupDriverId: userId,
          },
          {
            deliveryDriverId: userId,
          },
        ],
      },
      select: {
        id: true,
        trackingCode: true,
      },
    });
  }

  constructor(private prisma: PrismaService) {}

  async findAllCommissions(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [
        'vehicleTypeId',
        'commissionType',
        'vehicleType',
        'currency',
      ],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.vehicleCommission.findMany({
        ...query,

        where: {
          ...query.where,
          isActive: true,
        },
        select: {
          id: true,
          // vehicleTypeId: true,
          value: true,
          commissionType: true,
          effectiveFrom: true,
          effectiveTo: true,
          currency: true,
          // vehicleType: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
        },
      }),
      this.prisma.vehicleCommission.count({
        where: {
          ...query.where,
          isActive: true,
        },
      }),
    ]);

    const commissions = results[0] || [];
    const total = results[1] || 0;
    return {
      commissions,
      pagination: feature.getPagination(total),
    };
  }

  async findCommissionById(id: string) {
    return this.prisma.vehicleCommission.findUnique({
      where: { id },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
        value: true,
        effectiveFrom: true,
        effectiveTo: true,
        currency: true,
        createdAt: true,
        createdBy: true,
      },
    });
  }
  async deleteCommission(id: string, userId: string) {
    return this.prisma.vehicleCommission.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        updatedBy: userId,
      },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
        value: true,
        effectiveFrom: true,
        effectiveTo: true,
        currency: true,
        createdAt: true,
        createdBy: true,
      },
    });
  }

  async hardDeleteCommission(id: string) {
    return this.prisma.vehicleCommission.delete({
      where: { id },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
        value: true,
        effectiveFrom: true,
        effectiveTo: true,
        currency: true,
        createdAt: true,
        createdBy: true,
      },
    });
  }

  async addCommission(data: AddCommissionDto, userId: string) {
    return this.prisma.vehicleCommission.create({
      data: {
        // c: data.vehicleTypeId,
        commissionType: data.commissionType,
        value: data.value,
        effectiveFrom: data.effectiveFrom ?? new Date(),
        effectiveTo: data.effectiveTo ?? null,
        currency: data.currency,
        createdBy: userId,
      },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
        value: true,
        effectiveFrom: true,
        effectiveTo: true,
        currency: true,
        createdAt: true,
      },
    });
  }

  async updateCommission(data: updateCommissionDto, id: string, userId: any) {
    return this.prisma.vehicleCommission.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      select: {
        id: true,
        // vehicleTypeId: true,
        commissionType: true,
        value: true,
        effectiveFrom: true,
        effectiveTo: true,
        currency: true,
        // vehicleType: true,
        createdAt: true,
        updatedBy: true,
      },
    });
  }
  async findDriverById(driverId: string) {
    return this.prisma.user.findUnique({ where: { id: driverId } });
  }
  //===================================TARIFF==========================================================

  // Create tariff group (without airport fees)
  async createTariffGroup(payload: any) {
    return this.prisma.tariffGroup.create({
      data: payload,
      include: {
        serviceTypes: true,
        weightBuckets: true,
        driverCommissions: true,
        miscCharges: true,
        profitMargin: true,
      },
    });
  }

  // Create airport fee for a specific service type
  async createAirportNewFee(
    serviceTypeId: string,
    flatRatePerKg: number,
    brackets?: any[],
  ) {
    return this.prisma.airportNewFee.create({
      data: {
        flatRatePerKg: flatRatePerKg ?? null,

        // Connect the existing TariffServiceType record
        serviceType: {
          connect: { id: serviceTypeId },
        },

        // Brackets (optional)
        brackets: brackets?.length
          ? {
              create: brackets.map((b) => ({
                minKg: b.minKg,
                maxKg: b.maxKg,
                rate: b.rate,
              })),
            }
          : undefined,
      },
      include: {
        brackets: true,
      },
    });
  }

  // Find any tariff that overlaps the given period for that serviceType
  async findOverlappingTariff(
    serviceType: ServiceType,
    effectiveFrom: Date,
    effectiveTo?: Date | null,
    shippingScope?: ShippingScope,
  ) {
    const highDate = effectiveTo ?? new Date('9999-12-31T23:59:59.999Z');
    return this.prisma.tariffGroup.findFirst({
      where: {
        serviceTypes: { some: { serviceType } },
        shippingScope,
        AND: [
          { effectiveFrom: { lte: highDate } },
          {
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: effectiveFrom } },
            ],
          },
        ],
      },
    });
  }

  // Optional: check duplicate by name + serviceType
  async findByNameAndServiceType(
    name: string,
    serviceType: ServiceType,
    shippingScope: ShippingScope,
  ) {
    return this.prisma.tariffGroup.findFirst({
      where: { name, serviceTypes: { some: { serviceType } }, shippingScope },
    });
  }
  async findAllTariff(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'shippingScope', 'serviceType', 'currency'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.tariffGroup.findMany({
        ...query,

        where: query.where || {},
        select: {
          id: true,
          name: true,
          shippingScope: true,
          currency: true,
          isActive: true,
          effectiveFrom: true,
          effectiveTo: true,
          createdAt: true,
          updatedAt: true,
          serviceTypes: {
            include: {
              airportFee: {
                include: {
                  brackets: true,
                },
              },
            },
          },
          profitMargin: true,
          // airportFee: true,
          miscCharges: true,
          driverCommissions: true,
          weightBuckets: true,
        },
      }),
      this.prisma.tariffGroup.count({ where: query.where || {} }),
    ]);

    const tariffs = results[0] || [];
    const total = results[1] || 0;
    return {
      tariffs,
      pagination: feature.getPagination(total),
    };
  }

  async findTariffById(id: string) {
    return this.prisma.tariffGroup.findUnique({
      where: { id },
      include: {
        serviceTypes: {
          include: { airportFee: { include: { brackets: true } } },
        },
        profitMargin: true,
        miscCharges: true,
        driverCommissions: true,
        weightBuckets: true,
      },
      // include: { surcharges: true, discounts: true },
    });
  }

  // -------------------------
  // TariffGroup basic update
  // -------------------------
  async updateBasicTariff(id: string, data: any) {
    return this.prisma.tariffGroup.update({
      where: { id },
      data,
    });
  }

  // -------------------------
  // TariffGroup
  // -------------------------
  async updateTariffGroup(id: string, data: any) {
    return this.prisma.tariffGroup.update({ where: { id }, data });
  }

  async getTariffGroup(id: string) {
    return this.prisma.tariffGroup.findUnique({
      where: { id },
      include: {
        serviceTypes: {
          include: { airportFee: { include: { brackets: true } } },
        },
        weightBuckets: true,
        driverCommissions: true,
        miscCharges: true,
        profitMargin: true,
      },
    });
  }

  // -------------------------
  // ServiceType
  // -------------------------
  async createServiceType(data: any) {
    return this.prisma.tariffServiceType.create({ data });
  }

  async updateServiceType(id: string, data: any) {
    return this.prisma.tariffServiceType.update({ where: { id }, data });
  }

  // -------------------------
  // AirportFee
  // -------------------------
  async createAirportFee(data: any) {
    return this.prisma.airportNewFee.create({ data });
  }

  async updateAirportFee(fee: AirportFeesDto & { tariffGroupId?: string }) {
    if (!fee.id) throw new Error('Fee ID is required for update');

    // Extract the fields you want to update
    const updateData: any = {
      serviceType: fee.serviceType,
      flatRatePerKg: fee.flatRatePerKg ?? null,
      tariffGroupId: fee.tariffGroupId,
    };

    return this.prisma.airportNewFee.update({
      where: { id: fee.id }, // ✅ correct unique identifier
      data: updateData, // ✅ only update fields, not the whole object
    });
  }

  async getAirportFee(id: string) {
    return this.prisma.airportNewFee.findUnique({
      where: { id },
      include: { brackets: true },
    });
  }

  // async updateAirportFee(id: string, data: Partial<AirportFeesDto>) {
  //   return this.prisma.airportNewFee.update({
  //     where: { id },
  //     data,
  //   });
  // }

  async deleteBrackets(feeId: string) {
    return this.prisma.airportFeeBracket.deleteMany({
      where: { airportFeeId: feeId },
    });
  }

  async upsertBracket(where: any, update: any, create: any) {
    return this.prisma.airportFeeBracket.upsert({ where, update, create });
  }
  async createAirportFeeBracket(data: {
    airportFeeId: string;
    minKg: number;
    maxKg: number;
    rate: number;
  }) {
    return this.prisma.airportFeeBracket.create({ data });
  }

  async upsertAirportFeeBracket(where: any, update: any, create: any) {
    return this.prisma.airportFeeBracket.upsert({ where, update, create });
  }
  // 2️⃣ Upsert an airport fee bracket
  // async upsertAirportFeeBracket(
  //   where: { id?: string } | { airportFeeId_serviceType: { airportFeeId: string; serviceType: string } },
  //   update: any,
  //   create: any
  // ) {
  //   return this.prisma.airportFeeBracket.upsert({
  //     where,
  //     update,
  //     create,
  //   });
  // }

  // 3️⃣ Delete brackets not in a list (for updating)
  async deleteAirportFeeBracketsNotIn(airportFeeId: string, keepIds: string[]) {
    return this.prisma.airportFeeBracket.deleteMany({
      where: {
        airportFeeId,
        id: { notIn: keepIds },
      },
    });
  }

  // 4️⃣ Delete all brackets for a fee (for flat rate case)
  async deleteAirportFeeBracketsByFeeId(airportFeeId: string) {
    return this.prisma.airportFeeBracket.deleteMany({
      where: { airportFeeId },
    });
  }

  // -------------------------
  // WeightBucket
  // -------------------------
  async createWeightBucket(data: any) {
    return this.prisma.weightBucket.create({ data });
  }

  async updateWeightBucket(id: string, data: any) {
    return this.prisma.weightBucket.update({ where: { id }, data });
  }

  // -------------------------
  // DriverCommission
  // -------------------------
  async createDriverCommission(data: any) {
    return this.prisma.tariffVehicleCommission.create({ data });
  }

  async updateDriverCommission(id: string, data: any) {
    return this.prisma.tariffVehicleCommission.update({ where: { id }, data });
  }

  // -------------------------
  // MiscCharge
  // -------------------------
  async createMiscCharge(data: any) {
    return this.prisma.miscCharge.create({ data });
  }

  async updateMiscCharge(id: string, data: any) {
    return this.prisma.miscCharge.update({ where: { id }, data });
  }

  // -------------------------
  // ProfitMargin
  // -------------------------
  async createProfitMargin(data: any) {
    return this.prisma.profitNewMargin.create({ data });
  }

  async updateProfitMargin(id: string, data: any) {
    return this.prisma.profitNewMargin.update({ where: { id }, data });
  }

  async deleteTariff(id: string) {
    return this.prisma.tariffGroup.delete({ where: { id } });
  }
  //==========================================================================================================PROFIT MARGIN==========================================================================================================

  async findAll(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['shippingScope', 'serviceType'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.profitNewMargin.findMany({
        ...query,
        where: query.where || {},
      }),
      await this.prisma.profitNewMargin.count({ where: query.where || {} }),
    ]);

    const profitMargins = results[0] || [];
    const total = results[1] || 0;
    return {
      profitMargins,
      pagination: feature.getPagination(total),
    };
  }

  async findProfitMarginById(id: string) {
    return this.prisma.profitNewMargin.findUnique({
      where: { id },
      include: { tariff: true },
    });
  }

  async findByTariffId(tariffId: string) {
    return this.prisma.profitNewMargin.findFirst({
      where: { tariffId },
      include: { tariff: true },
    });
  }

  async deleteProfitMargin(id: string) {
    return this.prisma.profitNewMargin.delete({ where: { id } });
  }
  //========================================================================AIRPORT FEES==========================================================================

  async findAllAirportFees(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['airportCode', 'shippingCope', 'serviceType'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      await this.prisma.airportNewFee.findMany({
        ...query,
        where: query.where || {},
        // include: {
        //   tariff: true,
        // },
      }),
      await this.prisma.airportNewFee.count({ where: query.where || {} }),
    ]);

    const airportFees = results[0] || [];
    const total = results[1] || 0;
    return {
      airportFees,
      pagination: feature.getPagination(total),
    };
  }

  async findAirportFeeById(id: string) {
    return this.prisma.airportNewFee.findUnique({
      where: { id },
      // include: { ta: true },
    });
  }

  async deleteAirportFee(id: string) {
    return this.prisma.airportNewFee.delete({
      where: { id },
    });
  }

  // ── HELPER: FIND CUSTOMER CATEGORY BY USER ID ──
  async findCustomerCategoryByUserId(userId: string) {
    // 1️⃣ Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;

    // 2️⃣ Map User.customerType enum to CustomerCategory
    if (!user.customerType) return null;

    const category = await this.prisma.customerCategory.findFirst({
      where: { name: user.customerType }, // assuming CustomerCategory.name matches enum values
      // include: { discountRules: true },
    });
    return category;
  }
  //===================================CUSTOMER CATEGORY==========================================================
  async createCustomerCategory(data: CustomerCategoryDto) {
    return this.prisma.customerCategory.create({
      data,
    });
  }

  async findAllCustomerCategory(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'description'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      await this.prisma.customerCategory.findMany({
        ...query,
        where: query.where || {},
        // include: { discountRules: true },
      }),
      await this.prisma.customerCategory.count({ where: query.where || {} }),
    ]);

    const customerCategories = results[0] || [];
    const total = results[1] || 0;
    return {
      customerCategories,
      pagination: feature.getPagination(total),
    };
  }

  async findCustomerCategoryById(id: string) {
    return this.prisma.customerCategory.findUnique({
      where: { id },
      // include: { discountRules: true },
    });
  }

  async updateCustomerCategory(id: string, data: UpdateCustomerCategoryDto) {
    return this.prisma.customerCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCustomerCategory(id: string) {
    return this.prisma.customerCategory.delete({
      where: { id },
    });
  }

  async findCustomerById(userId: string) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findCustomerCategoryByName(name: string) {
    return this.prisma.customerCategory.findFirst({
      where: { name },
    });
  }
  //===================================PRICE CALCULATION LOG==========================================================
  async createPriceCalculationLog(data: any) {
    return this.prisma.priceCalculationLog.create({ data });
  }

  async findAllPriceCalculationLog(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.priceCalculationLog.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          weight: true,
          distance: true,
          baseRate: true,
          appliedRate: true,
          finalPrice: true,
          currency: true,
          createdAt: true,
          order: {
            select: {
              id: true,
              trackingCode: true,
              notes: true,
              customer: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              shipmentType: true,
              shippingScope: true,
              serviceType: true,
            },
          },
          surcharges: true,
          discounts: true,
          miscFees: true,
          airportFee: true,
          profit: true,
        },
      }),
      this.prisma.priceCalculationLog.count({ where: query.where || {} }),
    ]);

    const priceCalculationLogs = results[0] || [];
    const total = results[1] || 0;
    return {
      priceCalculationLogs,
      pagination: feature.getPagination(total),
    };
  }

  async findPriceCalculationLogById(id: string) {
    return this.prisma.priceCalculationLog.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async deletePriceCalculationLog(id: string) {
    return this.prisma.priceCalculationLog.delete({ where: { id } });
  }
  //=================================================================================================CALCULATE PRICE==========================================================

  // 3️⃣ Get profit margin by tariff
  async getProfitMarginByTariff(tariffId: string) {
    return this.prisma.profitNewMargin.findFirst({
      where: { tariffId },
    });
  }

  // 1️⃣ Get order by ID with customer included
  async getOrderById(orderId: string, options?: { includeCustomer?: boolean }) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: options?.includeCustomer ? true : false,
      },
    });
  }

  // 2️⃣ Find tariff by shipping scope and service type
  async findTariffByScopeAndServiceType(
    scope: ShippingScope,
    serviceType: ServiceType,
  ) {
    return this.prisma.tariffGroup.findFirst({
      where: {
        serviceTypes: {
          some: {
            serviceType,
          },
        },
        isActive: true,
      },
      include: {
        miscCharges: true,
        // airportFee: true,
        profitMargin: true,
        serviceTypes: {
          include: {
            airportFee: {
              include: {
                brackets: true,
              },
            },
          },
        },
        weightBuckets: true,
        driverCommissions: {
          select: {
            id: true,
            vehicleTypeId: true,
            fixed: true,
            percentage: true,
            perKm: true,
          },
        },
      },
    });
  }

  async findTariffByScopeAndServiceTypeAndCustomerCategory(
    shippingScope: ShippingScope,
    serviceType: ServiceType,
    customerCategoryId?: string,
  ) {
    return this.prisma.tariffGroup.findFirst({
      where: {
        serviceTypes: {
          some: {
            serviceType,
          },
        },
        shippingScope,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        ...(customerCategoryId ? { customerCategoryId } : {}), // ✅ Only adds filter if provided
      },
      include: {
        miscCharges: true,
        // airportFee: true,
        profitMargin: true,
      },
    });
  }

  // Optional: fetch CustomerCategory of a user
  async getCustomerCategoryByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.customerType) return null;
    return this.prisma.customerCategory.findFirst({
      where: { name: user.customerType },
    });
  }

  // 3️⃣ Log price calculation
  /**
   * Save price calculation log + update order price atomically
   */
  async logPriceCalculationAndUpdateOrder(data: {
    orderId: string;
    weight: number;
    distance: number;
    baseRate: number;
    appliedRate: number;
    surcharges: any[];
    discounts: any[];
    miscFees: any[];
    profit: { total: number };
    airportFee: { total: number };
    finalPrice: number;
    currency: string;
    tariffId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create log
      const log = await tx.priceCalculationLog.create({
        data: {
          orderId: data.orderId,
          weight: data.weight,
          distance: data.distance,
          baseRate: data.baseRate,
          appliedRate: data.appliedRate,
          surcharges: data.surcharges,
          discounts: data.discounts,
          miscFees: data.miscFees,
          profit: data.profit,
          airportFee: data.airportFee,
          finalPrice: data.finalPrice,
          currency: data.currency,
        },
      });

      // 2️⃣ Update order price
      await tx.order.update({
        where: { id: data.orderId },
        data: {
          cost: data.finalPrice,
          finalPrice: data.finalPrice,
          currency: data.currency,
          tariffId: data.tariffId,
        },
      });

      return log;
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Fetch total payments for a driver
  // Get all completed segments for an order
  async getCompletedSegments(orderId: string) {
    return this.prisma.orderRouteSegment.findMany({
      where: {
        orderId,
        status: 'COMPLETED',
        driverPaymentId: null, // only unpaid segments
      },
      include: {
        driver: true,
        order: true,
      },
    });
  }

  async getOrdersSegments(orderIds: string[]) {
    return this.prisma.orderRouteSegment.findMany({
      where: {
        orderId: { in: orderIds },
      },
      include: {
        driver: {
          select: {
            id: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            pickupConfirmed: true,
            actualDeliveryAt: true,
            dropoffConfirmed: true,
            finalPrice: true,
            fulfillmentType: true,
            deliveryDriverId: true,
            pickupDriverId: true,
            trackingCode: true,
          },
        },
      },
    });
  }

  async getOrderCancellationInfo(orderId: string) {
    return this.prisma.orderException.findFirst({
      where: {
        orderId,
      },
    });
  }
  async getOrderCancellationInfoBulk(orderIds: string[]) {
    if (!orderIds.length) return [];

    // Fetch all order exceptions for the given order IDs in a single query
    const cancellations = await this.prisma.orderException.findMany({
      where: {
        orderId: { in: orderIds },
      },
      select: {
        orderId: true,
        createdBy: true,
        reason: true, // optional, keep any fields you need
        createdAt: true,
      },
    });

    return cancellations;
  }

  // Get vehicle commissions for a vehicle type
  async getVehicleCommissions(vehicleTypeId: string) {
    return this.prisma.tariffVehicleCommission.findMany({
      where: {
        vehicleTypeId,
      },
      include: {
        vehicleType: true,
      },
    });
  }

  async createDriverPaymentsBulk(
    driverId: string,
    payments: {
      orderId: string;
      amount: number;
      distanceKm: number;
      segments: OrderRouteSegment[];
    }[],
  ) {
    const createPromises = payments.map((p) =>
      this.prisma.driverPayment.create({
        data: {
          driverId,
          orderId: p.orderId,
          amount: p.amount,
          distanceKm: p.distanceKm,
          currency: 'ETB',
          segments: {
            connect: p.segments.map((seg) => ({ id: seg.id })),
          },
        },
      }),
    );
    // Use $transaction to run all inserts atomically
    return this.prisma.$transaction(createPromises);
  }

  async batchCreateDriverPayments(
    payments: {
      driverId: string;
      orderId: string;
      amount: number;
      distanceKm: number;
      currency?: string;
      segments: string[];
    }[],
  ) {
    // Prisma doesn't support nested connect in createMany, so we do sequential create
    return Promise.all(payments.map((p) => this.createDriverPayment(p)));
  }

  // Get all segments for driver which are completed but not yet in a payment
  async getPendingSegments(driverId: string) {
    return this.prisma.orderRouteSegment.findMany({
      where: {
        driverId,
        status: 'COMPLETED',
        driverPaymentId: null, // not yet paid
      },
      include: {
        order: {
          select: {
            id: true,
            finalPrice: true,
            status: true,
            pickupConfirmed: true,
            dropoffConfirmed: true,
            actualDeliveryAt: true,
            trackingCode: true,
          },
        },
      },
    });
  }

  async getDriver(userId: string) {
    return this.prisma.driver.findUnique({
      where: { userId: userId },
      select: {
        id: true,
      },
    });
  }

  async getVehicle(driverId: string) {
    return this.prisma.vehicle.findFirst({
      where: {
        driver: {
          userId: driverId,
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  // Create a DriverPayment record
  async createDriverPayment(data: {
    driverId: string;
    orderId: string;
    amount: number;
    distanceKm: number;
  }) {
    return this.prisma.driverPayment.create({
      data,
    });
  }

  // Update segments with the payment ID to prevent double calculation
  async markSegmentsPaid(segmentIds: string[], paymentId: string) {
    return this.prisma.orderRouteSegment.updateMany({
      where: { id: { in: segmentIds } },
      data: { driverPaymentId: paymentId },
    });
  }

  // Get total earnings for driver
  async getDriverEarnings(driverId: string) {
    return this.prisma.driverPayment.aggregate({
      where: { driverId, status: 'COMPLETED' },
      _sum: { amount: true, distanceKm: true },
      _count: { id: true },
    });
  }
  async getDriverPayment(driverId: string) {
    return this.prisma.driverPayment.findMany({
      where: {
        driver: {
          userId: driverId,
        },
      },
      select: {
        id: true,
        amount: true,
        distanceKm: true,
        status: true,
        currency: true,
        order: {
          select: {
            id: true,
            trackingCode: true,
          },
        },
      },
    });
  }

  async findBranchById(branchId: any) {
    return this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      select: {
        id: true,
        name: true,
        address: {
          select: {
            lat: true,
            long: true,
          },
        },
      },
    });
  }
}
