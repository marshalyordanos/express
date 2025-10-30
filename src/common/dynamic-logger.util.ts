// import * as winston from 'winston';
// import * as fs from 'fs';
// import * as path from 'path';
// import 'winston-daily-rotate-file';

// export function createServiceLogger(serviceName: string, moduleName: string) {
//   const baseDir = path.join('logs', serviceName, moduleName);
//   if (!fs.existsSync(baseDir)) {
//     fs.mkdirSync(baseDir, { recursive: true });
//   }

//   const fileFormat = winston.format.combine(
//     winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     winston.format.printf(({ timestamp, level, message, context }) => {
//       return `[${timestamp}] [${level.toUpperCase()}] [${context ?? 'App'}]: ${message}`;
//     }),
//   );

//   // 🔁 Daily rotate transport creator
//   const makeRotate = (filename: string, level: string) =>
//     new winston.transports.DailyRotateFile({
//       filename: path.join(baseDir, `${filename}-%DATE%.log`),
//       datePattern: 'YYYY-MM-DD',
//       level,
//       zippedArchive: true,
//       maxSize: '10m',
//       maxFiles: '30d', // Auto delete older than 30 days
//     });

//   return winston.createLogger({
//     level: 'debug', // capture all levels
//     format: fileFormat,
//     transports: [
//       makeRotate('info', 'info'),
//       makeRotate('debug', 'debug'),
//       makeRotate('error', 'error'),
//       new winston.transports.Console({
//         format: winston.format.combine(
//           winston.format.colorize(),
//           winston.format.printf(({ level, message, context }) => {
//             return `[${level.toUpperCase()}] [${context ?? 'App'}]: ${message}`;
//           }),
//         ),
//       }),
//     ],
//     exceptionHandlers: [makeRotate('exceptions', 'error')],
//     rejectionHandlers: [makeRotate('rejections', 'error')],
//   });
// }
import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
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
    log: chalk.white, // fallback for default Winston log
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

  const logger = createLogger({
    level: 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
      // 🖥️ Console transport
      new transports.Console({
        format: combine(colorize(), consoleFormat),
      }),

      // 📁 File transports
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'info-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'debug-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'debug',
        maxFiles: '15d',
        zippedArchive: true,
        format: fileFormat,
      }),
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'warn-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'warn',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        zippedArchive: true,
        format: fileFormat,
      }),
      new transports.DailyRotateFile({
        filename: path.join(logDir, 'security-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'warn', // security logs use warn level
        maxFiles: '90d',
        zippedArchive: true,
        format: fileFormat,
      }),
      new transports.DailyRotateFile({
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
  logger.info(msg); // map to info so it goes into info + system file
};

  return logger as ServiceLogger;
}
