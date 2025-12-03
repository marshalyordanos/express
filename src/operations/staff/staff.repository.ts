import { Injectable } from '@nestjs/common';
import { User, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../user/user.entity';
import { CreateDriver, RegisterStaffDto, UpdateStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

@Injectable()
export class StaffRepository {
  constructor(private prisma: PrismaService) {}

  async changeUserRole(userId: string, role: Role): Promise<Partial<User>> {
    // Update user with new role
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: { connect: { id: role.id } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        role: {
          select: { id: true, name: true },
        },
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivateStaff(id: string, userId: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  /** 🔹 Get last customId for a role (fallback if Redis missing) */
  async getLastCustomId(prefix: string, roleAbbr: string) {
    const lastUser = await this.prisma.user.findFirst({
      where: { customId: { startsWith: `${prefix}-${roleAbbr}-` } },
      orderBy: { createdAt: 'desc' },
      select: { customId: true },
    });
    return lastUser?.customId || null;
  }

  async createNotificationPreferences(id: string) {
    return this.prisma.userNotificationPreferences.create({
      data: {
        user: { connect: { id } },
        email: true,
        inApp: true,
        push: false,
      },
    });
  }

  async findStaffByEmailAndPhone(
    email: string,
    phone: string,
  ): Promise<{ existingEmailStaff: any; existingStaffPhone: any }> {
    const [existingEmailStaff, existingStaffPhone] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phone } }),
    ]);

    return { existingEmailStaff, existingStaffPhone };
  }

  async findRoleById(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  /** 🔹 Find user by email */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** 🔹 Create user */
  async createStaff(data: any) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        customId: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        isStaff: true,
        isActive: true,
        role: {
          select: { id: true, name: true },
        },
        emergencyContactName: true,
        emergencyContactPhone: true,
      },
    });
  }

  /** 🔹 Find user by phone */
  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  // async createStaff(
  //   data: RegisterStaffDto,
  //   userId: string,
  // ): Promise<Partial<User>> {
  //   // Transform DTO into Prisma create input
  //   const prismaData: Prisma.UserCreateInput = {
  //     name: data.name,
  //     email: data.email,
  //     password: data.password,
  //     phone: data.phone,
  //     isStaff: true,
  //     isActive: true,
  //     emergencyContactName: data.emergencyContactName,
  //     emergencyContactPhone: data.emergencyContactPhone,
  //     role: data.role ? { connect: { id: data.role } } : undefined, // relation
  //     branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
  //     createdBy: userId,
  //   };

  //   return this.prisma.user.create({
  //     data: prismaData,
  //     select: {
  //       id: true,
  //       customId: true,
  //       name: true,
  //       email: true,
  //       phone: true,
  //       emailVerified: true,
  //       isStaff: true,
  //       isActive: true,
  //       role: {
  //         select: { id: true, name: true },
  //       },
  //       emergencyContactName: true,
  //       emergencyContactPhone: true,
  //     },
  //   });
  // }

  async findRoleByName(roleName: string) {
    return this.prisma.role.findUnique({
      where: { name: roleName },
      select: { id: true },
    });
  }
  async findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true },
    });
  }

  async findStaffByRole(roleId: string, payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });
    const query = feature.getQuery();
    // Merge roleId condition with query.where
    const where = {
      ...query.where,
      roleId, // 🔹 ensures we filter only staff with this roleId
    };
    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          isActive: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          ...query.where, // from PrismaQueryFeature
          ...where, // additional filters (e.g., isStaff)
        },
      }),
    ]);

    const Staffs = results[0] || [];
    const total = results[1] || 0;

    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, branch: true },
    });
  }
  async deleteStaff(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
  async findStaffById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        isActive: true,
        role: {
          select: { id: true, name: true },
        },
        branch: {
          select: { id: true, name: true },
        },
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async findAllStaff(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();

    console.log('Query to be queried : ', query);

    // 🔹 Optimize: select only needed fields instead of deleting later
    const [Staffs, total] = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where: {
          ...query.where,
          isStaff: true, // optional: filter only staff
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          isActive: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.user.count({
        where: {
          ...query.where,
          isStaff: true,
        },
      }),
    ]);

    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }

  async updateStaff(id: string, data: UpdateStaffDto) {
    return await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });
  }

  async findStaffByBranch(payload: ListQueryDto, branchId: string) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'email', 'phone'],
    });

    const query = feature.getQuery();
    console.log('query: ', query);

    // Merge roleId condition with query.where
    const where = {
      ...query.where,
      branchId, // 🔹 ensures we filter only staff with this roleId
    };

    const results = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          isActive: true,
          role: {
            select: { id: true, name: true },
          },
          branch: {
            select: { id: true, name: true },
          },
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const Staffs = results[0] || [];
    const total = results[1] || 0;
    return {
      Staffs,
      pagination: feature.getPagination(total),
    };
  }

  async assignStaffToBranch(staffIds: string[], branchId: string) {
    return await this.prisma.user.updateMany({
      where: { id: { in: staffIds } },
      data: { branchId },
    });
  }

  async findVehicleById(vehicleId: string) {
    return await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
  }

  //  async createDriver(data: CreateDriver, userId: string) {
  //     return this.prisma.$transaction(async (tx) => {
  //       // 1️⃣ Create User
  //       const user = await tx.user.create({
  //         data: {
  //           name: data.name,
  //           email: data.email,
  //           phone: data.phone ?? null,
  //           password: '', // System-generated placeholder
  //           isStaff: data.type === 'INTERNAL',
  //           isActive: true,
  //           roleId: data.roleId,
  //           emergencyContactName: data.emergencyContactName,
  //           emergencyContactPhone: data.emergencyContactPhone,
  //           createdBy: userId || 'system',
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           phone: true,
  //           roleId: true,
  //         },
  //       });

  //       // 2️⃣ Create Driver (connected to User)
  //       const driver = await tx.driver.create({
  //         data: {
  //           userId: user.id,
  //           vehicleId: data.vehicleId,
  //           status: data.status,
  //           type: data.type,
  //           licenseNumber: data.licenseNumber,
  //           licenseExpiry: data.licenseExpiry,
  //           currentLat: data.currentLat ?? null,
  //           currentLon: data.currentLong ?? null,
  //           createdBy: userId || 'system',
  //         },
  //         select: {
  //           id: true,
  //           vehicleId: true,
  //           status: true,
  //           type: true,
  //           licenseNumber: true,
  //           licenseExpiry: true,
  //         },
  //       });

  //       // 3️⃣ Log Location (only if coordinates exist)
  //       if (data.currentLat && data.currentLong) {
  //         await tx.driverLocationLog.create({
  //           data: {
  //             driverId: driver.id,
  //             latitude: data.currentLat,
  //             longitude: data.currentLong,
  //             speed: 0,
  //             heading: 0,
  //           },
  //         });
  //       }

  //       // 4️⃣ Update Vehicle’s assigned driver
  //       await tx.vehicle.update({
  //         where: { id: data.vehicleId },
  //         data: { driverId: driver.id },
  //       });

  //       // ✅ Return combined result
  //       return { user, driver };
  //     });
  //   }

  /** 🔹 Create driver + user transaction */
  async createDriver(userData: any, driverData: any, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Create user
      const user = await tx.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roleId: true,
          customId: true,
        },
      });

      // 2️⃣ Create driver
      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          vehicleId: driverData.vehicleId ?? null,
          status: driverData.status,
          type: driverData.type,
          licenseNumber: driverData.licenseNumber,
          licenseExpiry: driverData.licenseExpiry,
          licenseIssue: driverData.licenseIssue ?? null,
          frontImageUrl: driverData.frontImageUrl ?? null,
          backImageUrl: driverData.backImageUrl ?? null,
          currentLat: parseFloat(driverData.currentLat) ?? null,
          currentLon: parseFloat(driverData.currentLong) ?? null,
          createdBy: userId || 'system',
        },
        select: {
          id: true,
          vehicleId: true,
          status: true,
          type: true,
          licenseNumber: true,
          licenseExpiry: true,
        },
      });

      // 3️⃣ Log driver location (optional)
      if (driverData.currentLat && driverData.currentLong) {
        await tx.driverLocationLog.create({
          data: {
            driverId: driver.id,
            latitude: parseFloat(driverData.currentLat),
            longitude: parseFloat(driverData.currentLong),
            speed: 0,
            heading: 0,
          },
        });
      }

      // 4️⃣ Update vehicle assignment
      // await tx.vehicle.update({
      //   where: { id: driverData.vehicleId },
      //   data: { driverId: driver.id },
      // });

      return { user, driver };
    });
  }

  async findDriver(payload: ListQueryDto) {
    // Start building dynamic filters
    const conditions: any[] = [];

    // Apply general search (text)
    if (payload.search) {
      conditions.push({
        OR: [
          { user: { name: { contains: payload.search, mode: 'insensitive' } } },
          {
            user: { email: { contains: payload.search, mode: 'insensitive' } },
          },
          {
            user: { phone: { contains: payload.search, mode: 'insensitive' } },
          },
          {
            vehicles: {
              some: {
                plateNumber: { contains: payload.search, mode: 'insensitive' },
              },
            },
          },
          {
            vehicles: {
              some: {
                model: { contains: payload.search, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    }

    // Parse filters
    let filters: any = {};
    if (typeof payload.filter === 'string') {
      try {
        filters = JSON.parse(payload.filter);
      } catch {
        filters = {};
      }
    } else if (typeof payload.filter === 'object' && payload.filter !== null) {
      filters = payload.filter;
    }

    // Apply optional filters
    if (filters.status) conditions.push({ status: filters.status });
    if (filters.type) conditions.push({ type: filters.type });
    if (filters.vehicleStatus) {
      conditions.push({
        vehicles: { some: { status: filters.vehicleStatus } },
      });
    }
    if (filters.userId) conditions.push({ userId: filters.userId });
    if (filters.vehicleId) {
      conditions.push({ vehicles: { some: { id: filters.vehicleId } } });
    }

    // Only include AND if we actually have conditions
    const where = conditions.length > 0 ? { AND: conditions } : {};

    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: [
        'user.name',
        'user.email',
        'user.phone',
        'vehicles.plateNumber',
        'vehicles.model',
      ],
    });

    const baseQuery = feature.getQuery();
    delete baseQuery.orderBy; // remove any sorting
    const query = {
      ...baseQuery,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        vehicles: {
          select: { id: true, plateNumber: true, model: true, status: true },
        },
      },
    };

    const [drivers, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany(query),
      this.prisma.driver.count({ where }),
    ]);

    return {
      drivers,
      pagination: feature.getPagination(total),
    };
  }
}
