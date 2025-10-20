import { Injectable } from '@nestjs/common';
import { ServiceType, ShippingScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AirportFeeDto,
  CustomerCategoryDto,
  MiscellaneousFeeDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
  UpdateAirportFeeDto,
  UpdateCustomerCategoryDto,
  UpdateDiscountDto,
  UpdateMiscellaneousFeeDto,
  UpdateProfitMarginDto,
  UpdateTariffDto,
} from './pricing.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class PricingRepository {
  constructor(private prisma: PrismaService) {}
  //===================================TARIFF==========================================================

  // DB-only create (assumes validated payload)
  async createTariff(data: TariffDto) {
    return this.prisma.tariff.create({ data });
  }

  // Find any tariff that overlaps the given period for that serviceType
  async findOverlappingTariff(
    serviceType: ServiceType,
    effectiveFrom: Date,
    effectiveTo?: Date | null,
    shippingScope?: ShippingScope,
  ) {
    const highDate = effectiveTo ?? new Date('9999-12-31T23:59:59.999Z');
    return this.prisma.tariff.findFirst({
      where: {
        serviceType,
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
    return this.prisma.tariff.findFirst({
      where: { name, serviceType, shippingScope },
    });
  }
  // async createTariff(data: TariffDto) {
  //   console.log("Tariff Repo data : ", data);

  //   return this.prisma.tariff.create({
  //   data: {
  //     ...data,
  //     effectiveFrom: new Date(data.effectiveFrom), // ✅ convert to Date
  //     effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
  //   },
  // });
  // }

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
      this.prisma.tariff.findMany({
        ...query,

        where: query.where || {},
        select: {
          id: true,
          name: true,
          shippingScope: true,
          serviceType: true,
          currency: true,
          baseFee: true,
          perKgRate: true,
          perKmRate: true,
          isActive: true,
          effectiveFrom: true,
          effectiveTo: true,
          createdAt: true,
          updatedAt: true,
          customerCategory: {
            select: {
              id: true,
              name: true,
            },
          },
          surcharges: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
              description: true,
              isActive: true,
              serviceType: true,
              shippingScope: true,
              createdAt: true,
            },
          },
          discounts: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
              description: true,
              isActive: true,
              validFrom: true,
              validTo: true,
              serviceType: true,
              shippingScope: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.tariff.count({ where: query.where || {} }),
    ]);

    const tariffs = results[0] || [];
    const total = results[1] || 0;
    return {
      tariffs,
      pagination: feature.getPagination(total),
    };
  }

  async findTariffById(id: string) {
    return this.prisma.tariff.findUnique({
      where: { id },
      include: { surcharges: true, discounts: true },
    });
  }

  async updateTariff(id: string, data: Partial<UpdateTariffDto>) {
    return this.prisma.tariff.update({
      where: { id },
      data: {
        ...data,
        effectiveFrom: data.effectiveFrom
          ? new Date(data.effectiveFrom)
          : undefined,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      },
    });
  }

  async deleteTariff(id: string) {
    return this.prisma.tariff.delete({ where: { id } });
  }
  //==========================================================================================================PROFIT MARGIN==========================================================================================================
  async createProfitMargin(data: ProfitMarginDto) {
    return this.prisma.profitMargin.create({
      data: {
        ...data,
      },
    });
  }

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
      this.prisma.profitMargin.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          serviceType: true,
          shippingScope: true,
          percentage: true,
          maxAmount: true,
          minAmount: true,
          createdAt: true,
          updatedAt: true,
          tariff: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      await this.prisma.profitMargin.count({ where: query.where || {} }),
    ]);

    const profitMargins = results[0] || [];
    const total = results[1] || 0;
    return {
      profitMargins,
      pagination: feature.getPagination(total),
    };
  }

  async findProfitMarginById(id: string) {
    return this.prisma.profitMargin.findUnique({
      where: { id },
      include: { tariff: true },
    });
  }

  async findByTariffId(tariffId: string) {
    return this.prisma.profitMargin.findFirst({
      where: { tariffId },
      include: { tariff: true },
    });
  }

  async updateProfitMargin(id: string, data: UpdateProfitMarginDto) {
    return this.prisma.profitMargin.update({ where: { id }, data });
  }

  async deleteProfitMargin(id: string) {
    return this.prisma.profitMargin.delete({ where: { id } });
  }
  //========================================================================AIRPORT FEES==========================================================================
  async createAirportFee(data: AirportFeeDto) {
    return this.prisma.airportFee.create({
      data: {
        ...data,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      },
    });
  }

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
      await this.prisma.airportFee.findMany({
        ...query,
        where: query.where || {},
        include: {
          tariff: true,
        },
      }),
      await this.prisma.airportFee.count({ where: query.where || {} }),
    ]);

    const airportFees = results[0] || [];
    const total = results[1] || 0;
    return {
      airportFees,
      pagination: feature.getPagination(total),
    };
  }

  async findAirportFeeById(id: string) {
    return this.prisma.airportFee.findUnique({
      where: { id },
      include: { tariff: true },
    });
  }

  async updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>) {
    return this.prisma.airportFee.update({
      where: { id },
      data: {
        ...data,
        effectiveFrom: data.effectiveFrom
          ? new Date(data.effectiveFrom)
          : undefined,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      },
    });
  }

  async deleteAirportFee(id: string) {
    return this.prisma.airportFee.delete({
      where: { id },
    });
  }

  async findOverlappingAirportFee(
    data: AirportFeeDto,
    from: Date,
    to: Date | null,
  ) {
    return this.prisma.airportFee.findFirst({
      where: {
        tariffId: data.tariffId,
        airportCode: data.airportCode,
        // serviceType: data.serviceType,
        OR: [
          { effectiveTo: null },
          {
            AND: [
              { effectiveFrom: { lte: to ?? new Date('9999-12-31') } },
              { effectiveTo: { gte: from } },
            ],
          },
        ],
      },
    });
  }
  //==========================================================================================================MISCELLANEOUS FEES==========================================================================================================
  async createMiscFee(data: MiscellaneousFeeDto) {
    return this.prisma.miscFee.create({
      data: {
        ...data,
        // effectiveFrom: new Date(data.effectiveFrom),
        // effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      },
    });
  }

  async findAllMiscFees(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [
        'name',
        'feeType',
        'description',
        'shippingCope',
        'serviceType',
      ],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      await this.prisma.miscFee.findMany({
        ...query,
        where: query.where || {},
        include: {
          tariff: true,
        },
      }),
      await this.prisma.miscFee.count({ where: query.where || {} }),
    ]);

    const miscFees = results[0] || [];
    const total = results[1] || 0;
    return {
      miscFees,
      pagination: feature.getPagination(total),
    };
  }

  async findMiscFeeById(id: string) {
    return this.prisma.miscFee.findUnique({
      where: { id },
      include: { tariff: true },
    });
  }

  async updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>) {
    return this.prisma.miscFee.update({
      where: { id },
      data: {
        ...data,
        // effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        // effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      },
    });
  }

  async deleteMiscFee(id: string) {
    return this.prisma.miscFee.delete({ where: { id } });
  }

  // async findOverlappingMiscellaneousFee(data: MiscellaneousFeeDto, from: Date, to: Date | null) {
  //   return this.prisma.airportFee.findFirst({
  //     where: {
  //       tariffId: data.tariffId,
  //       name: data.name,
  //       // serviceType: data.serviceType,
  //       OR: [
  //         { effectiveTo: null },
  //         {
  //           AND: [
  //             { effectiveFrom: { lte: to ?? new Date('9999-12-31') } },
  //             { effectiveTo: { gte: from } },
  //           ],
  //         },
  //       ],
  //     },
  //   });
  // }
  //===================================SURCHARGE==========================================================
  async createSurcharge(data: SurchargeDto) {
    return this.prisma.surcharge.create({ data });
  }

  async updateSurcharge(id: string, data: Partial<SurchargeDto>) {
    return this.prisma.surcharge.update({ where: { id }, data });
  }

  async findSurchargeById(id: string) {
    return this.prisma.surcharge.findUnique({ where: { id } });
  }

  async findAllSurcharge(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      await this.prisma.surcharge.findMany({
        ...query,
        where: query.where || {},
        include: {
          tariff: true,
        },
      }),
      await this.prisma.surcharge.count({ where: query.where || {} }),
    ]);

    const surcharges = results[0] || [];
    const total = results[1] || 0;
    return {
      surcharges,
      pagination: feature.getPagination(total),
    };
  }

  async deleteSurcharge(id: string) {
    return this.prisma.surcharge.delete({ where: { id } });
  }
  //===================================DISCOUNT==========================================================

  // ── CREATE DISCOUNT ──
  async createDiscount(data: any) {
    return this.prisma.discountRule.create({
      data: {
        ...data,
        validFrom: new Date(data.validFrom),
        validTo: data.validTo ? new Date(data.validTo) : null,
      },
      include: {
        tariff: true,
        customerCategory: true,
      },
    });
  }

  // ── FIND ALL DISCOUNTS ──
  async findAllDiscount(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      await this.prisma.discountRule.findMany({
        ...query,
        where: query.where || {},
        include: {
          tariff: true,
          customerCategory: true,
        },
      }),
      await this.prisma.discountRule.count({ where: query.where || {} }),
    ]);

    const discounts = results[0] || [];
    const total = results[1] || 0;
    return {
      discounts,
      pagination: feature.getPagination(total),
    };
  }

  // ── FIND DISCOUNT BY ID ──
  async findDiscountById(id: string) {
    return this.prisma.discountRule.findUnique({
      where: { id },
      include: {
        tariff: true,
        customerCategory: true,
      },
    });
  }

  // ── UPDATE DISCOUNT ──
  async updateDiscount(
    id: string,
    data: Partial<UpdateDiscountDto>,
    validFrom: Date,
    validTo: Date | null,
  ) {
    return this.prisma.discountRule.update({
      where: { id },
      data: {
        ...data,
        validFrom: validFrom ? validFrom : undefined,
        validTo: validTo ? validTo : undefined,
      },
      include: {
        tariff: true,
        customerCategory: true,
      },
    });
  }

  // ── DELETE DISCOUNT ──
  async deleteDiscount(id: string) {
    return this.prisma.discountRule.delete({
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
      include: { discountRules: true },
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
        include: { discountRules: true },
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
      include: { discountRules: true },
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
  // async findCustomerCategoryByUserId(userId: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });
  //   if (!user) return null;

  //   // 2️⃣ Map User.customerType enum to CustomerCategory
  //   if (!user.customerType) return null;

  //   const category = await this.prisma.customerCategory.findFirst({
  //     where: { name: user.customerType }, // assuming CustomerCategory.name matches enum values
  //     include: { discountRules: true },
  //   });

  //   return category;
  // }

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
  // 1️⃣ Get order by ID
  // async getOrderById(orderId: string) {
  //   return this.prisma.order.findUnique({
  //     where: { id: orderId },
  //     include: {
  //       customer: { include: { customerType: true } },
  //     },
  //   });
  // }

  // 2️⃣ Find tariff by shipping scope and service type
  // async findTariffByScopeAndServiceType(shippingScope: ShippingScope, serviceType: ServiceType) {
  //   return this.prisma.tariff.findFirst({
  //     where: {
  //       serviceType,
  //       isActive: true,
  //     },
  //   });
  // }

  // 3️⃣ Get profit margin by tariff
  async getProfitMarginByTariff(tariffId: string) {
    return this.prisma.profitMargin.findFirst({
      where: { tariffId },
    });
  }

  // 4️⃣ Get airport fee by tariff + airport + serviceType
  // async getAirportFeeByTariffAndAirport(
  //   tariffId: string,
  //   airportCode?: string,
  //   serviceType?: string,
  // ) {
  //   if (!airportCode) return null;
  //   return this.prisma.airportFee.findFirst({
  //     where: {
  //       tariffId,
  //       airportCode,
  //       serviceType,
  //     },
  //   });
  // }

  // 5️⃣ Get misc fees by tariff
  async getMiscFeesByTariff(tariffId: string) {
    return this.prisma.miscFee.findMany({
      where: { tariffId },
    });
  }

  // 6️⃣ Get surcharges by tariff
  async getSurchargesByTariff(tariffId: string) {
    return this.prisma.surcharge.findMany({
      where: { tariffId, isActive: true },
    });
  }

  // 7️⃣ Get discounts by tariff
  async getDiscountsByTariff(tariffId: string) {
    return this.prisma.discountRule.findMany({
      where: { tariffId, isActive: true },
    });
  }

  // 8️⃣ Get customer discount by userId -> customer category
  // async getUserDiscounts(userId: string) {
  //   // Find customer type/category
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     include: { customerType: true },
  //   });

  //   if (!user || !user.customerType) return [];

  //   // Find discount rules by customer category
  //   return this.prisma.discountRule.findMany({
  //     where: {
  //       customerCategory: {
  //         name: user.customerType, // assumes enum/string match
  //       },
  //       isActive: true,
  //     },
  //   });
  // }

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
    return this.prisma.tariff.findFirst({
      where: {
        serviceType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      include: {
        miscFees: true,
        airportFees: true,
        surcharges: true,
        discounts: true,
        profitMargins: true,
      },
    });
  }

  async findTariffByScopeAndServiceTypeAndCustomerCategory(
    shippingScope: ShippingScope,
    serviceType: ServiceType,
    customerCategoryId?: string,
  ) {
    return this.prisma.tariff.findFirst({
      where: {
        serviceType,
        shippingScope,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        ...(customerCategoryId ? { customerCategoryId } : {}), // ✅ Only adds filter if provided
      },
      include: {
        miscFees: true,
        airportFees: true,
        surcharges: true,
        discounts: true,
        profitMargins: true,
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

  // Optional: fetch applicable discount rules for tariff + customer category
  async getDiscountRules(tariffId: string, customerCategoryId: string) {
    return this.prisma.discountRule.findMany({
      where: {
        tariffId,
        customerCategoryId,
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
      },
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
        },
      });

      return log;
    });
  }
}
