import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth.gateway.controller';
import { UserGatewayController } from './user.gateway.controller';
import { MicroserviceClientsModule } from './clients.module';
import { BranchGatewayController } from './branch.gateway.controller';
import { RoleGatewayController } from './role.gateway.controller';
import { FleetGatewayController } from './fleet.gatway.controller';

@Module({
  imports: [MicroserviceClientsModule],
  controllers: [
    AuthGatewayController,
    UserGatewayController,
    BranchGatewayController,
    RoleGatewayController,
    FleetGatewayController,
  ],
})
export class GatewayModule {}
