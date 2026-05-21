import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { EventService } from '../services/event.service.js';
import { validate } from '../validate.js';

const createEventBodySchema = z.object({
  entity_id: z.number().int().positive(),
  external_id: z.string().min(1).max(255),
  severity: z.enum(['info', 'warning', 'critical']),
  payload: z.record(z.unknown()).default({}),
});

export const createEventHandler =
  (service: EventService) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    const body = validate(reply, createEventBodySchema, req.body);
    if (!body) return;

    const result = await service.createEvent({
      entityId: body.entity_id,
      externalId: body.external_id,
      severity: body.severity,
      payload: body.payload,
    });

    if ('idempotent' in result && result.idempotent) {
      return reply.status(200).send(result);
    }

    return reply.status(201).send(result);
  };
