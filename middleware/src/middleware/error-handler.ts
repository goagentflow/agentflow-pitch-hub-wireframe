import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import type { ApiError } from '../types/api.js';

/**
 * Custom application error with code and retryable flag
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly retryable: boolean = false,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Common error factory functions
 */
export const Errors = {
  notFound: (resource: string, id: string): AppError =>
    new AppError(`${resource.toUpperCase()}_NOT_FOUND`, `${resource} with ID '${id}' not found`, 404, false, {
      [`${resource.toLowerCase()}Id`]: id,
    }),

  unauthorized: (message = 'Invalid or expired token'): AppError =>
    new AppError('UNAUTHORIZED', message, 401, false),

  forbidden: (message = 'Access denied'): AppError => new AppError('FORBIDDEN', message, 403, false),

  badRequest: (message: string, details?: Record<string, unknown>): AppError =>
    new AppError('BAD_REQUEST', message, 400, false, details),

  tenantMismatch: (hubTenant: string, userTenant: string): AppError =>
    new AppError('TENANT_MISMATCH', 'Hub does not belong to your tenant', 403, false, {
      hubTenant,
      userTenant,
    }),

  graphError: (message: string, retryable = true): AppError =>
    new AppError('GRAPH_API_ERROR', message, 502, retryable),

  rateLimited: (): AppError => new AppError('RATE_LIMITED', 'Too many requests', 429, true),
};

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const correlationId = req.correlationId || 'unknown';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: { issues: err.issues },
        retryable: false,
      },
    };
    logger.warn({ correlationId, issues: err.issues }, 'Validation error');
    res.status(400).json(response);
    return;
  }

  // Handle application errors
  if (err instanceof AppError) {
    const errorObj: ApiError['error'] = {
      code: err.code,
      message: err.message,
      retryable: err.retryable,
    };
    if (err.details !== undefined) {
      errorObj.details = err.details;
    }
    const response: ApiError = { error: errorObj };

    if (err.statusCode >= 500) {
      logger.error({ correlationId, err }, 'Application error');
    } else {
      logger.warn({ correlationId, code: err.code, message: err.message }, 'Client error');
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unexpected errors
  logger.error({ correlationId, err }, 'Unexpected error');
  const response: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      retryable: true,
    },
  };
  res.status(500).json(response);
}
