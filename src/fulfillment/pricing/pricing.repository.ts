import { Injectable } from '@nestjs/common';
import { OrderRouteSegment, ServiceType, ShippingScope } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddCommissionDto,
  AirportFeeDto,
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
  //  async findCommissions(userId: string) {
  //     return  this.prisma.driverCommission.findFirst({
  //       where: {
  //         driverId: userId,
  //       },
  //       select:{
  //         id: true,
  //         commissionType: true,
  //         amount:true,
  //         vehicleType: true,
  //       }
  //     });
  //   }

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

  // async getDriverEarning(
  //   payload: ListQueryDto,
  //   userId: string,
  //   orderIds: string[],
  // ) {
  //   const feature = new PrismaQueryFeature({
  //     search: payload.search,
  //     filter: payload.filter,
  //     sort: payload.sort,
  //     page: payload.page,
  //     pageSize: payload.pageSize,
  //     searchableFields: ['baseRate', 'appliedRate', 'currency', 'orderId'],
  //   });

  //   const query = feature.getQuery();

  //   const results = await Promise.all([
  //     this.prisma.priceCalculationLog.findMany({
  //       ...query,

  //       where: {
  //         ...query.where,
  //         orderIds,
  //       },
  //       select: {
  //         id: true,
  //         baseRate: true,
  //         appliedRate: true,
  //         currency: true,
  //         weight: true,
  //         distance: true,
  //       },
  //     }),
  //     this.prisma.priceCalculationLog.count({
  //       where: {
  //         ...query.where,
  //         orderIds,
  //       },
  //     }),
  //   ]);

  //   const driverEarning = results[0] || [];
  //   const total = results[1] || 0;
  //   return {
  //     driverEarning,
  //     pagination: feature.getPagination(total),
  //   };
  // }

  //  async findDriverAndCommission(driverId: string) {
  //     return await this.prisma.driverCommission.findFirst({
  //       where: {
  //         driverId: driverId,
  //         isActive: true,
  //       },
  //       select: {
  //         driverId: true,
  //       },
  //     });
  //   }

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

  // DB-only create (assumes validated payload)
  // async createTariff(data: TariffDto) {
  //   return this.prisma.tariff.create({ data });
  // }

  async createTariff(data: any) {
    // Use transaction if you want multi-table atomicity
    return await this.prisma.tariffGroup.create({
      data,
      include: {
        serviceTypes: true,
        weightBuckets: true,
        driverCommissions: true,
        miscCharges: true,
        airportFee: true,
        profitMargin: true,
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
          serviceTypes: true,
          profitMargin: true,
          airportFee: true,
          miscCharges: true,
          driverCommissions: true,
          weightBuckets: true,
          // customerCategory: {
          //   select: {
          //     id: true,
          //     name: true,
          //   },
          // },
          // surcharges: {
          //   select: {
          //     id: true,
          //     name: true,
          //     type: true,
          //     value: true,
          //     description: true,
          //     isActive: true,
          //     serviceType: true,
          //     shippingScope: true,
          //     createdAt: true,
          //   },
          // },
          // discounts: {
          //   select: {
          //     id: true,
          //     name: true,
          //     type: true,
          //     value: true,
          //     description: true,
          //     isActive: true,
          //     validFrom: true,
          //     validTo: true,
          //     serviceType: true,
          //     shippingScope: true,
          //     createdAt: true,
          //   },
          // },
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
        serviceTypes: true,
        profitMargin: true,
        airportFee: true,
        miscCharges: true,
        driverCommissions: true,
        weightBuckets: true,
      },
      // include: { surcharges: true, discounts: true },
    });
  }

 async updateTariff(id: string, data: any) {
  return this.prisma.tariffGroup.update({
    where: { id },
    data,
    include: {
      serviceTypes: true,
      weightBuckets: true,
      driverCommissions: true,
      miscCharges: true,
      airportFee: true,
      profitMargin: true,
    },
  });
}


  async deleteTariff(id: string) {
    return this.prisma.tariffGroup.delete({ where: { id } });
  }
  //==========================================================================================================PROFIT MARGIN==========================================================================================================
  async createProfitMargin(data: ProfitMarginDto) {
    return this.prisma.profitNewMargin.create({
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
      this.prisma.profitNewMargin.findMany({
        ...query,
        where: query.where || {},
        // select: {
        //   id: true,
        //   // serviceType: true,
        //   // shippingScope: true,
        //   percentage: true,
        //   // maxAmount: true,
        //   minAmount: true,
        //   createdAt: true,
        //   updatedAt: true,
        //   tariff: {
        //     select: {
        //       id: true,
        //       name: true,
        //     },
        //   },
        // },
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

  async updateProfitMargin(id: string, data: UpdateProfitMarginDto) {
    return this.prisma.profitNewMargin.update({ where: { id }, data });
  }

  async deleteProfitMargin(id: string) {
    return this.prisma.profitNewMargin.delete({ where: { id } });
  }
  //========================================================================AIRPORT FEES==========================================================================
  // async createAirportFee(data: AirportFeeDto) {
  //   return this.prisma.airportNewFee.create({
  //     data: {
  //       ...data,
  //       // effectiveFrom: new Date(data.effectiveFrom),
  //       // effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
  //     },
  //   });
  // }

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
        include: {
          tariff: true,
        },
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
      include: { tariff: true },
    });
  }

  // async updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>) {
  //   return this.prisma.airportNewFee.update({
  //     where: { id },
  //     data: {
  //       ...data,
  //       effectiveFrom: data.effectiveFrom
  //         ? new Date(data.effectiveFrom)
  //         : undefined,
  //       effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
  //     },
  //   });
  // }

  async deleteAirportFee(id: string) {
    return this.prisma.airportNewFee.delete({
      where: { id },
    });
  }

  // async findOverlappingAirportFee(
  //   data: AirportFeeDto,
  //   from: Date,
  //   to: Date | null,
  // ) {
  //   return this.prisma.airportNewFee.findFirst({
  //     where: {
  //       tariffId: data.tariffId,
  //       airportCode: data.airportCode,
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
  //==========================================================================================================MISCELLANEOUS FEES==========================================================================================================
  // async createMiscFee(data: MiscellaneousFeeDto) {
  //   return this.prisma.miscFee.create({
  //     data: {
  //       ...data,
  //       // effectiveFrom: new Date(data.effectiveFrom),
  //       // effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
  //     },
  //   });
  // }

  // async findAllMiscFees(payload: ListQueryDto) {
  //   const feature = new PrismaQueryFeature({
  //     search: payload.search,
  //     filter: payload.filter,
  //     sort: payload.sort,
  //     page: payload.page,
  //     pageSize: payload.pageSize,
  //     searchableFields: [
  //       'name',
  //       'feeType',
  //       'description',
  //       'shippingCope',
  //       'serviceType',
  //     ],
  //   });

  //   const query = feature.getQuery();
  //   console.log('quest1: ', query);

  //   const results = await Promise.all([
  //     await this.prisma.miscFee.findMany({
  //       ...query,
  //       where: query.where || {},
  //       include: {
  //         tariff: true,
  //       },
  //     }),
  //     await this.prisma.miscFee.count({ where: query.where || {} }),
  //   ]);

  //   const miscFees = results[0] || [];
  //   const total = results[1] || 0;
  //   return {
  //     miscFees,
  //     pagination: feature.getPagination(total),
  //   };
  // }

  // async findMiscFeeById(id: string) {
  //   return this.prisma.miscFee.findUnique({
  //     where: { id },
  //     include: { tariff: true },
  //   });
  // }

  // async updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>) {
  //   return this.prisma.miscFee.update({
  //     where: { id },
  //     data: {
  //       ...data,
  //       // effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
  //       // effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
  //     },
  //   });
  // }

  // async deleteMiscFee(id: string) {
  //   return this.prisma.miscFee.delete({ where: { id } });
  // }

  // // async findOverlappingMiscellaneousFee(data: MiscellaneousFeeDto, from: Date, to: Date | null) {
  // //   return this.prisma.airportFee.findFirst({
  // //     where: {
  // //       tariffId: data.tariffId,
  // //       name: data.name,
  // //       // serviceType: data.serviceType,
  // //       OR: [
  // //         { effectiveTo: null },
  // //         {
  // //           AND: [
  // //             { effectiveFrom: { lte: to ?? new Date('9999-12-31') } },
  // //             { effectiveTo: { gte: from } },
  // //           ],
  // //         },
  // //       ],
  // //     },
  // //   });
  // // }
  // //===================================SURCHARGE==========================================================
  // async createSurcharge(data: SurchargeDto) {
  //   return this.prisma.surcharge.create({ data });
  // }

  // async updateSurcharge(id: string, data: Partial<SurchargeDto>) {
  //   return this.prisma.surcharge.update({ where: { id }, data });
  // }

  // async findSurchargeById(id: string) {
  //   return this.prisma.surcharge.findUnique({ where: { id } });
  // }

  // async findAllSurcharge(payload: ListQueryDto) {
  //   const feature = new PrismaQueryFeature({
  //     search: payload.search,
  //     filter: payload.filter,
  //     sort: payload.sort,
  //     page: payload.page,
  //     pageSize: payload.pageSize,
  //     searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
  //   });

  //   const query = feature.getQuery();
  //   console.log('quest1: ', query);

  //   const results = await Promise.all([
  //     await this.prisma.surcharge.findMany({
  //       ...query,
  //       where: query.where || {},
  //       include: {
  //         tariff: true,
  //       },
  //     }),
  //     await this.prisma.surcharge.count({ where: query.where || {} }),
  //   ]);

  //   const surcharges = results[0] || [];
  //   const total = results[1] || 0;
  //   return {
  //     surcharges,
  //     pagination: feature.getPagination(total),
  //   };
  // }

  // async deleteSurcharge(id: string) {
  //   return this.prisma.surcharge.delete({ where: { id } });
  // }
  // //===================================DISCOUNT==========================================================

  // // ── CREATE DISCOUNT ──
  // async createDiscount(data: any) {
  //   return this.prisma.discountRule.create({
  //     data: {
  //       ...data,
  //       validFrom: new Date(data.validFrom),
  //       validTo: data.validTo ? new Date(data.validTo) : null,
  //     },
  //     include: {
  //       tariff: true,
  //       customerCategory: true,
  //     },
  //   });
  // }

  // // ── FIND ALL DISCOUNTS ──
  // async findAllDiscount(payload: ListQueryDto) {
  //   const feature = new PrismaQueryFeature({
  //     search: payload.search,
  //     filter: payload.filter,
  //     sort: payload.sort,
  //     page: payload.page,
  //     pageSize: payload.pageSize,
  //     searchableFields: ['name', 'type', 'shippingCope', 'serviceType'],
  //   });

  //   const query = feature.getQuery();
  //   console.log('quest1: ', query);

  //   const results = await Promise.all([
  //     await this.prisma.discountRule.findMany({
  //       ...query,
  //       where: query.where || {},
  //       include: {
  //         tariff: true,
  //         customerCategory: true,
  //       },
  //     }),
  //     await this.prisma.discountRule.count({ where: query.where || {} }),
  //   ]);

  //   const discounts = results[0] || [];
  //   const total = results[1] || 0;
  //   return {
  //     discounts,
  //     pagination: feature.getPagination(total),
  //   };
  // }

  // // ── FIND DISCOUNT BY ID ──
  // async findDiscountById(id: string) {
  //   return this.prisma.discountRule.findUnique({
  //     where: { id },
  //     include: {
  //       tariff: true,
  //       customerCategory: true,
  //     },
  //   });
  // }

  // // ── UPDATE DISCOUNT ──
  // async updateDiscount(
  //   id: string,
  //   data: Partial<UpdateDiscountDto>,
  //   validFrom: Date,
  //   validTo: Date | null,
  // ) {
  //   return this.prisma.discountRule.update({
  //     where: { id },
  //     data: {
  //       ...data,
  //       validFrom: validFrom ? validFrom : undefined,
  //       validTo: validTo ? validTo : undefined,
  //     },
  //     include: {
  //       tariff: true,
  //       customerCategory: true,
  //     },
  //   });
  // }

  // // ── DELETE DISCOUNT ──
  // async deleteDiscount(id: string) {
  //   return this.prisma.discountRule.delete({
  //     where: { id },
  //   });
  // }

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
    return this.prisma.profitNewMargin.findFirst({
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
  // async getMiscFeesByTariff(tariffId: string) {
  //   return this.prisma.miscFee.findMany({
  //     where: { tariffId },
  //   });
  // }

  // // 6️⃣ Get surcharges by tariff
  // async getSurchargesByTariff(tariffId: string) {
  //   return this.prisma.surcharge.findMany({
  //     where: { tariffId, isActive: true },
  //   });
  // }

  // // 7️⃣ Get discounts by tariff
  // async getDiscountsByTariff(tariffId: string) {
  //   return this.prisma.discountRule.findMany({
  //     where: { tariffId, isActive: true },
  //   });
  // }

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
        airportFee: true,
        profitMargin: true,
        serviceTypes: true,
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
        airportFee: true,
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

  // Optional: fetch applicable discount rules for tariff + customer category
  // async getDiscountRules(tariffId: string, customerCategoryId: string) {
  //   return this.prisma.discountRule.findMany({
  //     where: {
  //       tariffId,
  //       customerCategoryId,
  //       isActive: true,
  //       validFrom: { lte: new Date() },
  //       OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
  //     },
  //   });
  // }

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
