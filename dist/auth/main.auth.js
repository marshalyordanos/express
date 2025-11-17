"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth.module");
const auth_guard_1 = require("../common/auth.guard");
const jwt_1 = require("@nestjs/jwt");
const core_2 = require("@nestjs/core");
const nest_system_logger_util_1 = require("../common/nest-system-logger.util");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(auth_module_1.AuthModule, {
        logger: new nest_system_logger_util_1.NestSystemLogger('AuthService', 'System'),
        transport: microservices_1.Transport.TCP,
        options: {
            host: process.env.AUTH_HOST ?? '0.0.0.0',
            port: Number(process.env.AUTH_PORT ?? 4001),
        },
    });
    const jwtService = app.get(jwt_1.JwtService);
    const reflector = app.get(core_2.Reflector);
    app.useGlobalGuards(new auth_guard_1.JwtAuthGuard(jwtService, reflector));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen();
    console.log('Auth microservice running on TCP port', process.env.AUTH_PORT ?? 4001);
}
bootstrap();
//# sourceMappingURL=main.auth.js.map