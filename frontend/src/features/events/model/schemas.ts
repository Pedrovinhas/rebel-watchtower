import { z } from 'zod';

export const createEventSchema = z.object({
  entity_id: z.number({ required_error: 'Select an entity' }).int().positive(),
  external_id: z
    .string()
    .min(1, 'External ID is required')
    .max(255, 'External ID too long'),
  severity: z.enum(['info', 'warning', 'critical'], {
    required_error: 'Select event type',
  }),
  payload: z
    .string()
    .refine((s) => {
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid JSON')
    .default('{}'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
