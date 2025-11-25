import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BranchCreateDto, BranchUpdateDto } from './branch.entity';
import { Branch } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';
import e from 'express';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBranchAndBranchManager(managerId: string, branchId: string) {
    return await Promise.all([
      this.prisma.user.findUnique({ where: { id: managerId } }),
      this.prisma.branch.findUnique({
        where: { id: branchId },
        include: { manager: true }, // Check if branch has a manager
      }),
    ]);
  }

  async findManagedBranch(branchId: string, userId: string) {
    // Checking if user is already a manager of another branch
    return await this.prisma.branch.findFirst({
      where: {
        managerId: userId,
        id: { not: branchId }, // Exclude the current branch from searching
      },
    });
  }
  async revokeManager(branchId: string, managerId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      // Update Branch.managerId to null
      await prisma.branch.update({
        where: { id: branchId },
        data: { managerId: null },
      });

      // Update User.branchId to null
      await prisma.user.update({
        where: { id: managerId },
        data: { branchId: null },
      });
    });
  }
  async assignManager(branchId: string, managerId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Update Branch.managerId
      const updatedBranch = await prisma.branch.update({
        where: { id: branchId },
        data: { managerId },
      });

      // Update User.branchId
      await prisma.user.update({
        where: { id: managerId },
        data: { branchId },
      });

      return updatedBranch;
    });
  }

  deleteBranch(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }

  async updateBranch(id: string, data: Partial<BranchUpdateDto>) {
    const { address, managerId, ...branchData } = data;

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...branchData,
        ...(managerId && {
          manager: { connect: { id: managerId } },
        }),
        ...(address && {
          address: {
            upsert: {
              create: {
                label: address.label!,
                addressLine: address.addressLine!,
                city: address.city!,
                state: address.state ?? null,
                country: address.country ?? null,
                postalCode: address.postalCode ?? null,
                lat: address.lat,
                long: address.long,
                purpose: address.purpose ?? 'BRANCH_LOCATION',
              },
              update: {
                label: address.label ?? undefined,
                addressLine: address.addressLine ?? undefined,
                city: address.city ?? undefined,
                state: address.state ?? undefined,
                country: address.country ?? undefined,
                postalCode: address.postalCode ?? undefined,
                lat: address.lat ?? undefined,
                long: address.long ?? undefined,
              },
            },
          },
        }),
      },
      include: {
        address: {
          select: {
            id: true,
            label: true,
            city: true,
            country: true,
            state: true,
          },
        },
      },
    });
  }

  async findAllBranch(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'location'],
    });

    const query = feature.getQuery();

    // 1️⃣ Fetch branches with manager & staff count
    const [branches, totalBranches] = await Promise.all([
      this.prisma.branch.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          name: true,
          location: true,
          createdAt: true,
          createdBy: true,
          manager: { select: { id: true, name: true } },
          _count: { select: { staff: true } },
        },
      }),
      this.prisma.branch.count({ where: query.where || {} }),
    ]);

    const branchIds = branches.map((b) => b.id);

    // 2️⃣ Aggregate orders + revenue + interbranchActive per branch in **one query**
    const branchAnalytics = await this.prisma.$queryRaw<
      {
        branchId: string;
        totalOrders: number;
        activeOrders: number;
        interbranchActive: number;
        revenue: number;
      }[]
    >`
    SELECT 
      o."branchId",
      COUNT(*) AS "totalOrders",
      COUNT(*) FILTER (
        WHERE o."status" NOT IN ('DELIVERED', 'FAILED', 'CANCELED')
      ) AS "activeOrders",
      COUNT(*) FILTER (
        WHERE o."status" NOT IN ('DELIVERED', 'FAILED', 'CANCELED') 
          AND o."branchId" <> da."branchId"
      ) AS "interbranchActive",
      SUM(p."finalPrice") AS "revenue"
    FROM "Order" o
    LEFT JOIN "PriceCalculationLog" p ON p."orderId" = o.id
    LEFT JOIN "Address" da ON da.id = o."deliveryAddressId"
    WHERE o."branchId" = ANY(${branchIds})
    GROUP BY o."branchId"
  `;

    // 3️⃣ Map analytics for fast lookup
    const analyticsMap: Record<
      string,
      {
        totalOrders: number;
        activeOrders: number;
        interbranchActive: number;
        revenue: number;
      }
    > = {};
    branchAnalytics.forEach((a) => {
      analyticsMap[a.branchId] = {
        totalOrders: Number(a.totalOrders),
        activeOrders: Number(a.activeOrders),
        interbranchActive: Number(a.interbranchActive),
        revenue: Number(a.revenue || 0),
      };
    });

    // 4️⃣ Merge into branch results
    const enhancedBranches = branches.map((b) => {
      const analytics = analyticsMap[b.id] || {
        totalOrders: 0,
        activeOrders: 0,
        interbranchActive: 0,
        revenue: 0,
      };
      return {
        id: b.id,
        name: b.name,
        location: b.location,
        manager: b.manager,
        totalOrders: analytics.totalOrders,
        activeOrders: analytics.activeOrders,
        interbranchActive: analytics.interbranchActive,
        staffCount: b._count.staff,
        revenue: analytics.revenue,
        efficiency: analytics.totalOrders
          ? +(analytics.revenue / analytics.totalOrders).toFixed(2)
          : 0,
        status: analytics.activeOrders > 0 ? 'Active' : 'Inactive',
      };
    });

    return {
      branches: enhancedBranches,
      pagination: feature.getPagination(totalBranches),
    };
  }

  async createBranch(
    data: BranchCreateDto,
    address: any,
    userId: string,
  ): Promise<Branch> {
    return this.prisma.branch.create({
      data: {
        name: data.name,
        location: data.location,
        managerId: data.managerId ?? null,
        createdBy: userId,

        // 👇 Handle optional address creation (one-to-one via "BranchAddress" relation)
        ...(data.address && {
          address: {
            create: {
              label: address.label ?? 'branch label unknown',
              addressLine: address.addressLine ?? 'Unknown',
              city: address.city ?? 'Unknown',
              state: address.state ?? null,
              country: address.country ?? 'Ethiopia',
              postalCode: address.postalCode ?? null,
              lat: data.address.lat?.toString() ?? null, // ensure string
              long: data.address.long?.toString() ?? null,
              purpose: address.purpose ?? 'BRANCH_LOCATION',
              createdBy: userId,
            },
          },
        }),
      },
      include: { address: true },
    });
  }

  async findBranchById(id: string): Promise<Partial<Branch> | null> {
    return this.prisma.branch.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: {
          select: {
            id: true,
            label: true,
            state: true,
            city: true,
            country: true,
          },
        },
        orders: {
          select: {
            id: true,
            trackingCode: true,
          },
        },
      },
    });
  }

  async findAllBranchFree(payload: ListQueryDto) {
    const feature = new PrismaQueryFeature({
      search: payload.search,
      filter: payload.filter,
      sort: payload.sort,
      page: payload.page,
      pageSize: payload.pageSize,
      searchableFields: ['name', 'location'],
    });

    const query = feature.getQuery();

    const results = await Promise.all([
      this.prisma.branch.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          name: true,
          location: true,
        },
      }),
      this.prisma.branch.count({ where: query.where || {} }),
    ]);

    const branches = results[0] || [];
    const total = results[1] || 0;

    return {
      branches,
      pagination: feature.getPagination(total),
    };
  }
}
