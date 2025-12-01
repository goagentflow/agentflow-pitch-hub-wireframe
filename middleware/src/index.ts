import express, { type Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { correlationIdMiddleware, errorHandler } from './middleware/index.js';
import { healthRouter } from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Request parsing
app.use(express.json());

// Correlation ID - must be before logging
app.use(correlationIdMiddleware);

// Request logging
app.use(
  pinoHttp({
    logger,
    customProps: (req: Request) => ({
      correlationId: req.correlationId,
    }),
    // Don't log health checks in production
    autoLogging: {
      ignore: (req: Request) => req.url?.startsWith('/health') ?? false,
    },
  })
);

// Routes - health check (no auth)
app.use('/health', healthRouter);

// API v1 routes (auth required) - placeholder
app.use('/api/v1', (_req, res) => {
  res.json({
    message: 'AgentFlow Middleware API v1',
    docs: 'See docs/middleware/PRD_MVP_SUMMARY.md for API specification',
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      retryable: false,
    },
  });
});

// Global error handler - must be last
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'AgentFlow middleware started');
});

// Graceful shutdown
const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
