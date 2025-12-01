import { Router, type IRouter } from 'express';
import type { Request, Response } from 'express';

export const healthRouter: IRouter = Router();

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }[];
}

/**
 * Health check endpoint - no auth required
 * GET /health
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '0.1.0',
    checks: [
      { name: 'server', status: 'pass' },
      // Future: add Graph API connectivity check
      // Future: add SharePoint connectivity check
    ],
  };

  res.json(response);
});

/**
 * Readiness probe - for K8s
 * GET /health/ready
 */
healthRouter.get('/ready', (_req: Request, res: Response) => {
  // Future: check if dependencies are ready
  res.json({ ready: true });
});

/**
 * Liveness probe - for K8s
 * GET /health/live
 */
healthRouter.get('/live', (_req: Request, res: Response) => {
  res.json({ live: true });
});
