"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const services = [
    'gateway/main.gateway.js',
    'auth/main.auth.js',
    'operations/main.operations.js',
    'fulfillment/main.fulfillment.js',
    'notification/main.notification.js',
];
services.forEach((service, index) => {
    setTimeout(() => {
        const child = (0, child_process_1.fork)((0, path_1.join)(__dirname, service), [], {
            execArgv: ['--max-old-space-size=350'],
        });
        child.on('message', (msg) => console.log(`[${service}] ${msg}`));
        child.on('error', (err) => console.error(`[${service}] ERROR:`, err));
        child.on('exit', (code) => {
            if (code !== 0) {
                console.log(`[${service}] crashed with code ${code}, restarting in 5s...`);
                setTimeout(() => (0, child_process_1.fork)((0, path_1.join)(__dirname, service)), 5000);
            }
        });
        child.stdout?.on('data', (d) => process.stdout.write(`[${service}] ${d}`));
        child.stderr?.on('data', (d) => process.stderr.write(`[${service}] ${d}`));
        console.log(`Started ${service}`);
    }, index * 8000);
});
//# sourceMappingURL=main.app.js.map