import { NestFactory, Reflector } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { FulfillmentModule } from "./fulfillment.module";
import { ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../common/auth.guard";

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        FulfillmentModule,
        {
            transport: Transport.TCP,
            options:{
                host: '0.0.0.0',
                port: Number(process.env.FULFILLMENT_PORT ?? 4003),
            },
        },

    );
    const jwtService = app.get(JwtService);
    const reflector = app.get(Reflector);
   
    app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true
    }));

    await app.listen();

    console.log("Fulfillment microservice running on TCP port", process.env.FULFILLMENT_PORT ?? 4003);

}
bootstrap()