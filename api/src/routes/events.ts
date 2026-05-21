import type { FastifyInstance } from 'fastify';
import { createEventHandler } from '../controllers/event.controller.js';

export async function eventsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/events', createEventHandler(fastify.services.event));
}
