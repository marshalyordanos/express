import { CommunicationModule } from "./communication.module";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { JwtAuthGuard } from "../common/auth.guard";


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunicationModule,
    {
    //   logger: new NestSystemLogger('NotificationService', 'System'), //temporary fix
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.COMMUNICATION_PORT ?? 4005),
      },
    },
  );
  
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

  // app.useLogger(false); // temporary fix

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();

  console.log(
    'Communication microservice running on TCP port',
    process.env.COMMUNICATION_PORT ?? 4005,
  );
}
bootstrap();
