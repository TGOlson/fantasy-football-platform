import pino from 'pino';

// Create base logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Use pretty printing unless explicitly in production
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss.l',
          },
        }
      : undefined,
});
