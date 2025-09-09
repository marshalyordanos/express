import { Module } from '@nestjs/common';
import { UserMessageController } from './user/user.controller';
import { UserUseCasesImp } from './user/user.usecase.impl';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './user/user.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UserMessageController],
  providers: [UserUseCasesImp, UserRepository, PrismaService],
  exports: [UserUseCasesImp],
})
export class UserModule {}
