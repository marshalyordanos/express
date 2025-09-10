import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BranchCreateDto,
  BranchResponseDto,
  BranchUpdateDto,
} from './branch.entity';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  deleteBranch(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
  async updateBranch(id: string, data: Partial<BranchUpdateDto>) {
    return this.prisma.branch.update({ where: { id }, data });
  }
  async findAllBranch(): Promise<Branch[]> {
    return this.prisma.branch.findMany({
      select: {
        name: true,
        id: true,
        location: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
        manager: true,
        orders: true,
        staff: true,
      },
    });
  }
  createBranch(data: BranchCreateDto): Promise<Branch> {
    return this.prisma.branch.create({ data });
  }

  async findBranchById(id: string): Promise<Branch | null> {
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
