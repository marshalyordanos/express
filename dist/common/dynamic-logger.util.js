"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceLogger = createServiceLogger;
const winston_1 = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const { combine, timestamp, printf, colorize } = winston_1.format;
function createServiceLogger(serviceName, moduleName) {
    const logDir = path.join(process.cwd(), 'logs', serviceName, moduleName);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    const levelColors = {
        info: chalk.cyanBright,
        warn: chalk.yellowBright,
        error: chalk.redBright,
        debug: chalk.magenta,
        verbose: chalk.greenBright,
        security: chalk.redBright,
        system: chalk.whiteBright,
        log: chalk.white,
    };
    const consoleFormat = printf(({ level, message, timestamp: ts }) => {
        const levelStr = String(level ?? 'log').toLowerCase();
        const messageStr = String(message ?? '');
        const timestampStr = String(ts ?? new Date().toISOString());
        const colorFn = levelColors[levelStr] ?? ((txt) => txt);
        const timePart = timestampStr.includes('T')
            ? timestampStr.split('T')[1].split('.')[0]
            : timestampStr;
        const tag = chalk.cyan(`[${serviceName}]`);
        const mod = chalk.yellow(`[${moduleName}]`);
        return `${tag} ${mod} ${colorFn(levelStr.toUpperCase())} ${chalk.gray(timePart)}  ${messageStr}`;
    });
    const fileFormat = printf(({ level, message, timestamp }) => {
        const ts = typeof timestamp === 'string' ? timestamp : String(timestamp);
        const msg = String(message ?? '');
        const lvl = String(level ?? 'INFO').toUpperCase();
        return `${ts} [${lvl}] ${msg}`;
    });
    const createRotateTransport = (options) => {
        const transport = new DailyRotateFile(options);
        transport.on('rotate', (oldFilename, newFilename) => {
            console.log(chalk.gray(`📦 Rotated: ${path.basename(oldFilename)} → ${path.basename(newFilename)}`));
        });
        transport.on('archive', (zipFilename) => {
            console.log(chalk.green(`✅ Archived: ${path.basename(zipFilename)}`));
        });
        return transport;
    };
    const logger = (0, winston_1.createLogger)({
        level: 'debug',
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
        transports: [
            new winston_1.transports.Console({
                format: combine(colorize(), consoleFormat),
            }),
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
    logger.system = (msg) => {
        logger.info(msg);
    };
    return logger;
}
//# sourceMappingURL=dynamic-logger.util.js.map