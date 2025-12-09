import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

/**
 * Winston logger configuration
 * Provides structured logging with colorized console output in development
 * and JSON format in production
 */
export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, ms, context }) => {
          const ctx = context ? `[${context}]` : '';
          return `${timestamp} [${level}] ${ctx} ${message} ${ms}`;
        }),
      ),
    }),
  ],
};
