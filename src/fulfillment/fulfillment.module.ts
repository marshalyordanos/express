import { Module } from '@nestjs/common';
import { OrderMessageController } from './order/order.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrderUseCasesImpl } from './order/order.usecase.impl';
import { OrderRepository } from './order/order.repository';
import { PrismaService } from '../prisma/prisma.service';
import { DispatchMessageController } from './dispatch/dispatch.controller';
import { DispatchRepository } from './dispatch/dispatch.repository';
import { DispatchUseCasesImpl } from './dispatch/dispatch.usecase.impl';
import { PricingRepository } from './pricing/pricing.repository';
import { PricingMessageController } from './pricing/pricing.controller';
import { PricingUseCasesImpl } from './pricing/pricing.usecase.impl';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [OrderMessageController, DispatchMessageController, PricingMessageController],
  providers: [
    OrderRepository,
    OrderUseCasesImpl,
    PrismaService,
    DispatchRepository,
    DispatchUseCasesImpl,
    PricingRepository,
    PricingUseCasesImpl
  ],
  exports: [OrderUseCasesImpl, PrismaService, DispatchUseCasesImpl, PricingUseCasesImpl],
})
export class FulfillmentModule {}
