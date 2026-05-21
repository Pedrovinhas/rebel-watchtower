import type { FastifyReply } from 'fastify';
import { type ZodTypeAny, type TypeOf } from 'zod';

export function validate<S extends ZodTypeAny>(
  reply: FastifyReply,
  schema: S,
  data: unknown,
): TypeOf<S> | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    void reply.status(400).send({
      error: 'validation_error',
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(root)',
        message: issue.message,
      })),
    });
    return null;
  }
  return result.data;
}
