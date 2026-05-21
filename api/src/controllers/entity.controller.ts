import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { EntityService } from '../services/entity.service.js';
import { validate } from '../validate.js';

const createEntityBodySchema = z.object({
  name: z.string().min(1).max(255),
});

const listEntitiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['active', 'suspended']).optional(),
  search: z.string().min(1).max(100).optional(),
});

export const createEntityHandler =
  (service: EntityService) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    const body = validate(reply, createEntityBodySchema, req.body);
    if (!body) return;
    const entity = await service.createEntity({ name: body.name });
    return reply.status(201).send(entity);
  };

export const listEntitiesHandler =
  (service: EntityService) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    const query = validate(reply, listEntitiesQuerySchema, req.query);
    if (!query) return;
    const result = await service.listEntities(query.page, query.limit, {
      status: query.status,
      search: query.search,
    });
    return reply.send({
      data: result.data,
      meta: {
        total: result.total,
        page: query.page,
        limit: query.limit,
        pages: result.pages,
      },
    });
  };

export const getRankingHandler =
  (service: import('../services/event.service.js').EventService) =>
  async (_req: FastifyRequest, reply: FastifyReply) => {
    const ranking = await service.getRanking(10);
    return reply.send(ranking);
  };
