"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const services = [
    'dist/gateway/main.gateway.js',
    'dist/auth/main.auth.js',
    'dist/operations/main.operations.js',
    'dist/fulfillment/main.fulfillment.js',
    'dist/notification/main.notification.js',
];
services.forEach((service) => {
    const proc = (0, child_process_1.exec)(`node ${service}`);
    proc.stdout?.on('data', (data) => console.log(`[${service}] ${data}`));
    proc.stderr?.on('data', (err) => console.error(`[${service}] ${err}`));
});
//# sourceMappingURL=main.app.js.map