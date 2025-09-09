import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth.gateway.controller';
import { UserGatewayController } from './operations.gateway.controller';
import { MicroserviceClientsModule } from './clients.module';

@Module({
  imports: [MicroserviceClientsModule],
  controllers: [AuthGatewayController, UserGatewayController],
})
export class GatewayModule {}
