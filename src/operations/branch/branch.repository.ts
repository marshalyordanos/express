import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BranchCreateDto,
  BranchResponseDto,
  BranchUpdateDto,
} from './branch.entity';
import { Branch } from '@prisma/client';
import { IPagination } from 'src/common/types';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

async revokeManager(branchId: string, managerId: string): Promise<string> {
  // Fetching user and branch with manager details
  const [user, branch] = await Promise.all([
    this.prisma.user.findUnique({ where: { id: managerId } }),
    this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { manager: true }, // Check if branch has a manager
    }),
  ]);
    // Validate user and branch existence
  if (!user || !branch) {
    throw new Error('User or Branch not found');
  }

  if (branch.managerId !== managerId) {
    throw new Error('User is not the manager of this branch');
  }

  await this.prisma.$transaction(async (prisma) => {
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

  return 'Manager revoked successfully';
}
async assignManager(branchId: string, managerId: string): Promise<Branch> {
  // Fetching user and branch with manager details
  const [user, branch] = await Promise.all([
    this.prisma.user.findUnique({ where: { id: managerId } }),
    this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { manager: true }, // Check if branch has a manager
    }),
  ]);

  // Validate user and branch existence
  if (!user || !branch) {
    throw new Error('User or Branch not found');
  }

  //  Checking if branch already has a manager
  if (branch.managerId) {
    throw new Error('Branch already has a manager');
  }

  // Checking if user is already a manager of another branch
  const existingManagedBranch = await this.prisma.branch.findFirst({
    where: {
      managerId: user.id,
      id: { not: branchId }, // Exclude the current branch from searching
    },
  });

  if (existingManagedBranch) {
    throw new Error(`User is already a manager of branch ${existingManagedBranch.id}`);
  }

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
  async findAllBranch(
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<{
    branches: Branch[];
    pagination: IPagination;
  }> {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take: pageSize,
        where,
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
      this.prisma.branch.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      branches,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.prisma.branch.create({ data });
  }

  async findBranchById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
