import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4008 },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4009 },
      },
      {
        name: 'FULFILLMENT_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4007 },
      },
      {
        name: 'COMMUNICATION_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 4005 },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroserviceClientsModule {}
