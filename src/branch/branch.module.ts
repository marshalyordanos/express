import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchUseCaseImplementation } from './branch.useCase.implementation';
import { BranchRepository } from './branch.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [BranchController],
  providers: [
    {
      provide: 'BranchUseCases', // Token to match constructor
      useClass: BranchUseCaseImplementation, // Concrete implementation
    },
    BranchRepository,
    PrismaService,
  ],
  exports: ['BranchUseCases', BranchRepository],
})
export class BranchModule {}
