import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BranchCreateDto,
  BranchResponseDto,
  BranchUpdateDto,
} from './branch.entity';
import { Branch } from '@prisma/client';
import { IPagination } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
import { PrismaQueryFeature } from '../../common/query/prisma-query-feature';

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
    return this.prisma.branch.update({ where: { id }, data });
  }
  async findAllBranch(payload: ListQueryDto) {

        const feature = new PrismaQueryFeature({
          search: payload.search,
          filter: payload.filter,
          sort: payload.sort,
          page: payload.page,
          pageSize: payload.pageSize,
          searchableFields: ['name', 'description', 'location'],
        });

            const query = feature.getQuery();
    console.log('quest1: ', query);

    const results = await Promise.all([
      this.prisma.branch.findMany({
        ...query,
        where: query.where || {},
        select: {
          id: true,
          name: true,
          location: true,
          managerId: true,
          createdAt: true,
          updatedAt: true,
          manager: true,
          orders: true,
          staff: true,
        },
      }),
      this.prisma.branch.count({
        where: query.where || {},
      }),
    ]);

    const branches = results[0] || [];
    const total = results[1] || 0;

    return {
      branches,
      pagination: feature.getPagination(total),
    };
  }

  createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.prisma.branch.create({ data });
  }

  async findBranchById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
