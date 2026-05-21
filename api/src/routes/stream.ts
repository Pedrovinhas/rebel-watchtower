import { randomUUID } from 'crypto';
import { PassThrough } from 'stream';
import type { FastifyInstance } from 'fastify';

const HISTORY_LIMIT = 20;

export async function streamRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/events/stream', async (req, reply) => {
    const stream = new PassThrough();

    reply.headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const clientId = randomUUID();
    fastify.sse.addClient(clientId, stream);

    stream.write('retry: 3000\n\n');
    stream.write(':connected\n\n');

    const recent = await fastify.dao.event.getRecent(HISTORY_LIMIT);
    for (const event of recent.reverse()) {
      stream.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    const heartbeat = setInterval(() => {
      if (!stream.writableEnded) {
        stream.write(':heartbeat\n\n');
      }
    }, 15_000);

    req.raw.on('close', () => {
      clearInterval(heartbeat);
      fastify.sse.removeClient(clientId);
      stream.end();
    });

    return reply.send(stream);
  });
}
