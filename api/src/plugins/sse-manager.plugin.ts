import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { SseManager } from '../streaming/sse-manager.js';
import { PostgresEventListener } from '../streaming/postgres-event-listener.js';

export const sseManagerPlugin = fp(async (fastify: FastifyInstance) => {
  const eventListener = new PostgresEventListener(fastify.sql);
  const manager = new SseManager(eventListener);
  fastify.decorate('sse', manager);
});
