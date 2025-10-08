import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddressDto,
  CustomerCategoryDto,
  PreferencesDto,
  UpdateCorporateInfoDto,
  UpdateCustomerCategoryDto,
  UserUpdateDto,
} from './user.entity';
import { CorporateInfo, User } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(payload: ListQueryDto) {
    console.log('quest1: ', payload);

    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,

        where: query.where || {},
        select: {
          name: true,
          email: true,
          phone: true,

          isStaff: true,
          isSuperAdmin: true,

          createdAt: true,
          branch: true,
          addresses: true,
          customerType: true,
          role: true,
          corporateInfo: true,
          preferences: true,
        },
      }),
      this.prisma.user.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }
  async getAllCustomer(payload: ListQueryDto, roleId: string) {
    if (/roleId:[^,]*/.test(payload.filter)) {
      payload.filter = payload.filter.replace(
        /roleId:[^,]*/,
        `roleId:${roleId}`,
      );
    } else {
      payload.filter = payload.filter
        ? payload.filter + `,roleId:${roleId}`
        : `roleId:${roleId}`;
    }
    console.log('quest1: ', payload);

    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,

        where: query.where || {},
        select: {
          name: true,
          email: true,
          phone: true,

          isStaff: true,
          isSuperAdmin: true,

          createdAt: true,
          branch: true,
          addresses: true,
          customerType: true,
          role: true,
          corporateInfo: true,
          preferences: true,
        },
      }),
      this.prisma.user.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async updateUser(id: string, data: Partial<UserUpdateDto>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async addAddress(data: AddressDto) {
    const { userId, ...addressData } = data;

    return this.prisma.address.create({
      data: {
        ...addressData,
        user: { connect: { id: userId } }, // ✅ Connects relation correctly
      },
    });
  }

  async listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async updateAddress(id: string, data: any) {
    return this.prisma.address.update({ where: { id }, data });
  }

  async deleteAddress(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  async updatePreferences(userId: string, data: PreferencesDto) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });
  }

  async updateCorporateInfo(
    userId: string,
    data: UpdateCorporateInfoDto,
  ): Promise<CorporateInfo> {
    // Check if user exists and is corporate
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { corporateInfo: true },
    });

    if (!user) {
      throw new RpcException('User not found');
    }

    if (user.customerType != 'CORPORATE') {
      throw new RpcException('This user is not a corporate customer');
    }

    // Update corporate info
    const updatedCorporate = await this.prisma.corporateInfo.update({
      where: { userId: userId },
      data: {
        companyName: data.companyName ?? undefined,
        taxId: data.taxId ?? undefined,
        contactPerson: data.contactPerson ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
        contactEmail: data.contactEmail ?? undefined,
        industryType: data.industryType ?? undefined,
        website: data.website ?? undefined,
        address: data.address ?? undefined,
        notes: data.notes ?? undefined,
      },
    });

    return updatedCorporate;
  }
  async getCustomerOrders(payload: ListQueryDto, id: string): Promise<any> {
    if (/customerId:[^,]*/.test(payload.filter)) {
      payload.filter = payload.filter.replace(
        /customerId:[^,]*/,
        `customerId:${id}`,
      );
    } else {
      payload.filter = payload.filter
        ? payload.filter + `,customerId:${id}`
        : `customerId:${id}`;
    }
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [],
    });
    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.order.findMany({
        ...query,
        where: query.where || {},
      }),
      this.prisma.order.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;
    return {
      models,
      pagination: feature.getPagination(total),
    };
  }

  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({ where: { name: name } });
  }

  //==================================================================Customer Category====================================
  async listCategories(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'description'],
    });
    const query = feature.getQuery();
    const results = await Promise.all([
      this.prisma.customerCategory.findMany({
        ...query,
        where: query.where || {},
        include: {
          discountRules: true,
          pricingRules: true,
          tariffs: true,
          users: true,
        },
      }),
      this.prisma.customerCategory.count({ where: query.where || {} }),
    ]);

    const models = results[0] || [];
    const total = results[1] || 0;

    return {
      models,
      pagination: feature.getPagination(total),
    };
  }
  async deleteCategory(id: string) {
    return this.prisma.customerCategory.delete({ where: { id } });
  }
  async findCategory(id: string) {
    return this.prisma.customerCategory.findUnique({ where: { id } });
  }
  async updateCategory(id: string, data: Partial<UpdateCustomerCategoryDto>) {
    return this.prisma.customerCategory.update({ where: { id }, data });
  }
  async createCategory(data: CustomerCategoryDto) {
    return this.prisma.customerCategory.create({ data });
  }

  async assignCustomersToCategory(
    customerIds: string[],
    customerCategoryId: string,
  ) {
    console.log('customerIds repo: ', customerIds);
    console.log('customerCategoryId repo: ', customerCategoryId);

    return this.prisma.$transaction(async (tx) => {
      const updates = customerIds.map((customerId) =>
        tx.user.update({
          where: { id: customerId },
          data: { customerCategoryId },
        }),
      );

      return Promise.all(updates);
    });
  }

  async removeCustomersFromCategory(customerIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const updates = customerIds.map((customerId) =>
        tx.user.update({
          where: { id: customerId },
          data: { customerCategoryId: null },
        }),
      );

      return Promise.all(updates);
    });
  }
}
