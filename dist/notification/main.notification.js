"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_guard_1 = require("../common/auth.guard");
const nest_system_logger_util_1 = require("../common/nest-system-logger.util");
const notification_module_1 = require("./notification.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(notification_module_1.NotificationModule, {
        logger: new nest_system_logger_util_1.NestSystemLogger('NotificationService', 'System'),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const jwtService = app.get(jwt_1.JwtService);
    const reflector = app.get(core_1.Reflector);
    app.useGlobalGuards(new auth_guard_1.JwtAuthGuard(jwtService, reflector));
    await app.listen(0);
    console.log('Notification microservice running');
}
bootstrap();
//# sourceMappingURL=main.notification.js.map