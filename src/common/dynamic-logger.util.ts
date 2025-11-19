import { createLogger, format, transports, Logger } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';

const { combine, timestamp, printf, colorize } = format;

export interface ServiceLogger extends Logger {
  system?: (msg: string) => void;
}

export function createServiceLogger(
  serviceName: string,
  moduleName: string,
): ServiceLogger {
  const logDir = path.join(process.cwd(), 'logs', serviceName, moduleName);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 🎨 Color mapping for console output
  const levelColors: Record<string, (msg: string) => string> = {
    info: chalk.cyanBright,
    warn: chalk.yellowBright,
    error: chalk.redBright,
    debug: chalk.magenta,
    verbose: chalk.greenBright,
    security: chalk.redBright,
    system: chalk.whiteBright,
    log: chalk.white,
  };

  // 🖨️ Console format (safe)
  const consoleFormat = printf(({ level, message, timestamp: ts }) => {
    const levelStr = String(level ?? 'log').toLowerCase();
    const messageStr = String(message ?? '');
    const timestampStr = String(ts ?? new Date().toISOString());

    const colorFn = levelColors[levelStr] ?? ((txt: string) => txt);

    const timePart = timestampStr.includes('T')
      ? timestampStr.split('T')[1].split('.')[0]
      : timestampStr;

    const tag = chalk.cyan(`[${serviceName}]`);
    const mod = chalk.yellow(`[${moduleName}]`);

    return `${tag} ${mod} ${colorFn(levelStr.toUpperCase())} ${chalk.gray(timePart)}  ${messageStr}`;
  });

  // 🧾 File format (plain text)
  const fileFormat = printf(({ level, message, timestamp }) => {
    const ts = typeof timestamp === 'string' ? timestamp : String(timestamp);
    const msg = String(message ?? '');
    const lvl = String(level ?? 'INFO').toUpperCase();
    return `${ts} [${lvl}] ${msg}`;
  });

  // Helper function to create rotate file transport with event listener
  const createRotateTransport = (options: DailyRotateFile.DailyRotateFileTransportOptions) => {
    const transport = new DailyRotateFile(options);
    
    // Listen for rotation events
    transport.on('rotate', (oldFilename, newFilename) => {
      console.log(chalk.gray(`📦 Rotated: ${path.basename(oldFilename)} → ${path.basename(newFilename)}`));
    });

    // Listen for archive events (when zipping completes)
    transport.on('archive', (zipFilename) => {
      console.log(chalk.green(`✅ Archived: ${path.basename(zipFilename)}`));
    });

    return transport;
  };

  const logger = createLogger({
    level: 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
      // 🖥️ Console transport
      new transports.Console({
        format: combine(colorize(), consoleFormat),
      }),

      // 📁 File transports with rotation events
      createRotateTransport({
        filename: path.join(logDir, 'info-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      createRotateTransport({
        filename: path.join(logDir, 'debug-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'debug',
        maxFiles: '15d',
        zippedArchive: true,
        format: fileFormat,
      }),
      createRotateTransport({
        filename: path.join(logDir, 'warn-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'warn',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      createRotateTransport({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      createRotateTransport({
        filename: path.join(logDir, 'security-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'warn',
        maxFiles: '90d',
        zippedArchive: true,
        format: fileFormat,
      }),
      createRotateTransport({
        filename: path.join(logDir, 'system-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxFiles: '90d',
        zippedArchive: true,
        format: fileFormat,
      }),
    ],
  });

  // 🛠️ Add helper for system logs
  (logger as ServiceLogger).system = (msg: string) => {
    logger.info(msg);
  };

  return logger as ServiceLogger;
}
