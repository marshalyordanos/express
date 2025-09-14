import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth.gateway.controller';
import { UserGatewayController } from './user.gateway.controller';
import { MicroserviceClientsModule } from './clients.module';
import { BranchGatewayController } from './branch.gateway.controller';
import { RoleGatewayController } from './role.gateway.controller';

@Module({
  imports: [MicroserviceClientsModule],
  controllers: [
    AuthGatewayController,
    UserGatewayController,
    BranchGatewayController,
    RoleGatewayController,
  ],
})
export class GatewayModule {}
