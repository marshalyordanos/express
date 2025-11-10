import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../common/auth.guard';
import { NestSystemLogger } from '../common/nest-system-logger.util';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  // Create a normal NestJS app (not HTTP) because we are using WebSocket + Redis
  const app = await NestFactory.create(NotificationModule, {
    logger: new NestSystemLogger('NotificationService', 'System'),
  });

  // Apply global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply JWT auth guard globally if needed for WebSocket events
  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

  // Start the WebSocket gateway and Redis subscriptions automatically via providers
  await app.listen(0); // Not binding TCP, just start the app for DI

  console.log('Notification microservice running');
}
bootstrap();
