import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('3001')
    .transform((val) => Number(val)),

  // Azure AD - App Registration
  AZURE_TENANT_ID: z.string().min(1, 'AZURE_TENANT_ID is required'),
  AZURE_CLIENT_ID: z.string().min(1, 'AZURE_CLIENT_ID is required'),
  AZURE_CLIENT_SECRET: z.string().min(1, 'AZURE_CLIENT_SECRET is required'),

  // SharePoint
  SHAREPOINT_SITE_URL: z.string().url('SHAREPOINT_SITE_URL must be a valid URL'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

function loadEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.entries(formatted)
      .filter(([key, value]) => key !== '_errors' && value && '_errors' in value)
      .map(([key, value]) => `  ${key}: ${(value as { _errors: string[] })._errors.join(', ')}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${missing}`);
  }

  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
