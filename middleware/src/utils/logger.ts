import pino, { type LoggerOptions } from 'pino';
import { env } from '../config/env.js';

const baseOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'agentflow-middleware',
    env: env.NODE_ENV,
  },
};

const devOptions: LoggerOptions = {
  ...baseOptions,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
};

export const logger = pino(env.NODE_ENV === 'development' ? devOptions : baseOptions);

export type Logger = typeof logger;
