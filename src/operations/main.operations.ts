import { NestFactory, Reflector } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { OperationsModule } from './operations.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/auth.guard'; 
// import { NestSystemLogger } from '../common/nest-system-logger.util'; // temporary fix

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OperationsModule,
    {
      // logger: new NestSystemLogger('OperationsService', 'System'), //temoporary fix
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.USER_PORT ?? 4002),
      },
    },
  );
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

  app.useLogger(false); // temporary fix

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unexpected fields
      forbidNonWhitelisted: true, // throws error for extra fields
      transform: true, // auto-transform payloads to DTO classes
    }),
  );
  await app.listen();
  console.log(
    'User microservice running on TCP port',
    process.env.USER_PORT ?? 4002,
  );
}
bootstrap();
