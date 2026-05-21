import { z } from 'zod';

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),
  PORT: z.coerce.number().default(3000),
  SUSPENSION_THRESHOLD: z.coerce.number().default(10),
  RANKING_CACHE_TTL_MS: z.coerce.number().default(60_000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const config = ConfigSchema.parse(process.env);
