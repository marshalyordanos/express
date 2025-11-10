"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const operations_module_1 = require("./operations.module");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_guard_1 = require("../common/auth.guard");
const nest_system_logger_util_1 = require("../common/nest-system-logger.util");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(operations_module_1.OperationsModule, {
        logger: new nest_system_logger_util_1.NestSystemLogger('OperationsService', 'System'),
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: Number(process.env.USER_PORT ?? 4002),
        },
    });
    const jwtService = app.get(jwt_1.JwtService);
    const reflector = app.get(core_1.Reflector);
    app.useGlobalGuards(new auth_guard_1.JwtAuthGuard(jwtService, reflector));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen();
    console.log('User microservice running on TCP port', process.env.USER_PORT ?? 4002);
}
bootstrap();
//# sourceMappingURL=main.operations.js.map