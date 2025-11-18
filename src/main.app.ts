// src/main.app.ts  ← new version that survives on 500 MB RAM
import { fork } from 'child_process';
import { join } from 'path';

const services = [
  'gateway/main.gateway.js',
  'auth/main.auth.js',
  'operations/main.operations.js',
  'fulfillment/main.fulfillment.js',
  'notification/main.notification.js',
];

services.forEach((service, index) => {
  // Start each service with a small delay to avoid RAM spike
  setTimeout(() => {
    const child = fork(join(__dirname, service), [], {
      execArgv: ['--max-old-space-size=350'], // limit memory per process
    });

    child.on('message', (msg) => console.log(`[${service}] ${msg}`));
    child.on('error', (err) => console.error(`[${service}] ERROR:`, err));
    child.on('exit', (code) => {
      if (code !== 0) {
        console.log(`[${service}] crashed with code ${code}, restarting in 5s...`);
        setTimeout(() => fork(join(__dirname, service)), 5000);
      }
    });

    // Forward logs
    child.stdout?.on('data', (d) => process.stdout.write(`[${service}] ${d}`));
    child.stderr?.on('data', (d) => process.stderr.write(`[${service}] ${d}`));

    console.log(`Started ${service}`);
  }, index * 8000); // 8-second delay between each start
});