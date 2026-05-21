import type { Writable } from 'stream';
import type { IEventListener } from './interfaces/IEventListener.js';

interface SseClient {
  id: string;
  stream: Writable;
}

export class SseManager {
  private readonly clients = new Map<string, SseClient>();

  constructor(private readonly eventListener: IEventListener) {
    this.startListening();
  }

  private startListening(): void {
    this.eventListener
      .listen('new_event', (payload) => {
        this.broadcastRaw(payload);
      })
      .catch((err) => {
        console.error('[SseManager] LISTEN error:', err);
      });
  }

  addClient(id: string, stream: Writable): void {
    this.clients.set(id, { id, stream });
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  private broadcastRaw(payload: string): void {
    const dead: string[] = [];

    for (const [id, client] of this.clients) {
      try {
        client.stream.write(`data: ${payload}\n\n`);
      } catch {
        dead.push(id);
      }
    }

    for (const id of dead) {
      this.clients.delete(id);
    }
  }

  get clientCount(): number {
    return this.clients.size;
  }
}
