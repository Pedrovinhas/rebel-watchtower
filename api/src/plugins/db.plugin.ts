import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import sql from '../db.js';

export const dbPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('sql', sql);

  fastify.addHook('onClose', async () => {
    await sql.end();
  });
});
