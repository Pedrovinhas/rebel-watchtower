import Fastify from 'fastify';
import cors from '@fastify/cors';
import { dbPlugin } from './plugins/db.plugin.js';
import { daoPlugin } from './plugins/dao.plugin.js';
import { servicesPlugin } from './plugins/services.plugin.js';
import { sseManagerPlugin } from './plugins/sse-manager.plugin.js';
import { entitiesRoutes } from './routes/entities.js';
import { eventsRoutes } from './routes/events.js';
import { streamRoutes } from './routes/stream.js';
import { AppError } from './errors.js';
import { config } from './config.js';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      targets: [
        config.NODE_ENV === 'development'
          ? { target: 'pino-pretty', level: 'debug', options: { colorize: true } }
          : { target: 'pino/file', level: 'info', options: { destination: 1 } },
        {
          target: 'pino/file',
          level: 'error',
          options: { destination: '/app/logs/error.log', mkdir: true },
        },
      ],
    },
  },
});

await fastify.register(cors, {
  origin: true,
});

await fastify.register(dbPlugin);
await fastify.register(daoPlugin);
await fastify.register(servicesPlugin);
await fastify.register(sseManagerPlugin);

await fastify.register(entitiesRoutes);
await fastify.register(eventsRoutes);
await fastify.register(streamRoutes);

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.get('/api/config', async () => ({
  suspension_threshold: config.SUSPENSION_THRESHOLD,
}));

fastify.setErrorHandler((error, req, reply) => {
  if (error instanceof AppError) {
    fastify.log.warn({ err: { code: error.code, status: error.httpStatus }, url: req.url }, error.message);
    return reply
      .status(error.httpStatus)
      .send({ error: error.code, message: error.message });
  }

  const castError = error as unknown as Error;
  fastify.log.error({ err: castError, url: req.url }, 'Unhandled error');
  return reply
    .status(500)
    .send({ error: 'internal_error', message: 'Internal server error' });
});

const start = async () => {
  try {
    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
