import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { EntityDAO } from '../dao/entity.dao.js';
import { EventDAO } from '../dao/event.dao.js';

export const daoPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('dao', {
    entity: new EntityDAO(fastify.sql),
    event: new EventDAO(fastify.sql),
  });
});
