"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const gateway_module_1 = require("./gateway.module");
const error_1 = require("../common/error");
const swagger_1 = require("@nestjs/swagger");
const Permission_Bootstrapper_1 = require("./Permission.Bootstrapper");
const fs = require("fs");
const sanitize_pipe_1 = require("../common/sanitize.pipe");
const nest_system_logger_util_1 = require("../common/nest-system-logger.util");
async function bootstrap() {
    const app = await core_1.NestFactory.create(gateway_module_1.GatewayModule, {
        bufferLogs: true,
        logger: new nest_system_logger_util_1.NestSystemLogger('GatewayService', 'System'),
    });
    const sanitizePipe = await app.resolve(sanitize_pipe_1.SanitizePipe);
    app.useGlobalPipes(sanitizePipe, new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new error_1.AllExceptions());
    const bootstrapper = app.get(Permission_Bootstrapper_1.PermissionBootstrapper);
    await bootstrapper.run();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gateway API')
        .setDescription('API Gateway exposing all microservices endpoints')
        .setVersion('1.0')
        .build();
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: false,
    });
    app.set('trust proxy', true);
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    fs.writeFileSync('./openapi.json', JSON.stringify(document));
    const port = Number(process.env.GATEWAY_PORT ?? 10000);
    await app.listen(port, '0.0.0.0');
    console.log(`Gateway listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.gateway.js.map