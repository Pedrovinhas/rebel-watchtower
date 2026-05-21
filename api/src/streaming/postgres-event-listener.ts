import type { Sql } from '../db.js';
import type { IEventListener } from './interfaces/IEventListener.js';

export class PostgresEventListener implements IEventListener {
  constructor(private readonly sql: Sql) {}

  listen(channel: string, callback: (payload: string) => void): Promise<void> {
    return this.sql.listen(channel, callback).then(() => undefined);
  }
}
