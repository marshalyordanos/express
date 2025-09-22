import { Module } from '@nestjs/common';
import { UserMessageController } from './user/user.controller';
import { UserUseCasesImp } from './user/user.usecase.impl';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { BranchMessageController } from './branch/branch.controller';
import { BranchUseCaseImpl } from './branch/branch.useCase.impl';
import { BranchRepository } from './branch/branch.repository';
import { RoleRepository } from './role/role.repository';
import { RoleUseCaseImpl } from './role/role.useCase.impl';
import { RoleMessageController } from './role/role.controller';
import { VehicleRepository } from './fleet/fleet.repository';
import { FleetUseCasesImp } from './fleet/fleet.usecase.impl';
import { StaffUseCasesImpl } from './staff/staff.useCase.impl';
import { StaffMessageController } from './staff/staff.controller';
import { StaffRepository } from './staff/staff.repository';
import { FleetMessageController } from './fleet/fleet.controller';
import { AccessControlMessageController } from './acl/access_control.controller';
import { AccessControlUsecaseImpl } from './acl/access_control.usecase.impl';
import { AccessControlRepository } from './acl/access_control.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    UserMessageController,
    BranchMessageController,
    FleetMessageController,
    StaffMessageController,
    FleetMessageController,
    AccessControlMessageController,
  ],
  providers: [
    UserUseCasesImp,
    UserRepository,
    BranchUseCaseImpl,
    BranchRepository,
    PrismaService,
    VehicleRepository,
    FleetUseCasesImp,
    StaffUseCasesImpl,
    StaffRepository,
    AccessControlUsecaseImpl,
    AccessControlRepository,
  ],
  exports: [
    UserUseCasesImp,
    BranchUseCaseImpl,
    FleetUseCasesImp,
    StaffUseCasesImpl,
    AccessControlUsecaseImpl,
  ],
})
export class OperationsModule {}
