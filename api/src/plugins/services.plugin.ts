import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { EntityService } from '../services/entity.service.js';
import { EventService } from '../services/event.service.js';

export const servicesPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('services', {
    entity: new EntityService(fastify.dao.entity),
    event: new EventService(fastify.sql, fastify.dao.entity, fastify.dao.event),
  });
});
