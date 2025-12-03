import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { AllExceptions } from '../common/error';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PermissionBootstrapper } from './Permission.Bootstrapper';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { SanitizePipe } from '../common/sanitize.pipe';
import { NestSystemLogger } from '../common/nest-system-logger.util'; // temporary fix

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule, {
    bufferLogs: true,
    logger: new NestSystemLogger('GatewayService', 'System'), //temporary fix
  });
  // Get the SanitizePipe instance from DI container FIRST
  // const sanitizePipe = app.get(SanitizePipe);
  const sanitizePipe = await app.resolve(SanitizePipe);

  app.useGlobalPipes(
    sanitizePipe, // Use the DI instance
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  // app.useGlobalPipes(new SanitizePipe());
  app.useGlobalFilters(new AllExceptions());

  //  app.useLogger(false); // temporary fix

  // const bootstrapper = app.get(PermissionBootstrapper);
  // await bootstrapper.run();

  // --- Swagger Setup ---
  const config = new DocumentBuilder()
    .setTitle('Gateway API')
    .setDescription('API Gateway exposing all microservices endpoints')
    .setVersion('1.0')
    .build();

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });
  // const document = SwaggerModule.createDocument(app, config);

  app.set('trust proxy', true);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  fs.writeFileSync('./openapi.json', JSON.stringify(document));
  // ----------------------

  const port = 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`Gateway listening on port ${port}`);
}

bootstrap();
