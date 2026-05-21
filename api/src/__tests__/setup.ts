import { afterEach } from 'vitest';
import sql from '../db.js';

afterEach(async () => {
  await sql`TRUNCATE events, entities RESTART IDENTITY CASCADE`;
});
