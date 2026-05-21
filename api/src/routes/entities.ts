import type { FastifyInstance } from 'fastify';
import {
  createEntityHandler,
  listEntitiesHandler,
  getRankingHandler,
} from '../controllers/entity.controller.js';

export async function entitiesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/api/entities',
    createEntityHandler(fastify.services.entity),
  );

  fastify.get(
    '/api/entities',
    listEntitiesHandler(fastify.services.entity),
  );

  fastify.get(
    '/api/entities/ranking',
    getRankingHandler(fastify.services.event),
  );
}
