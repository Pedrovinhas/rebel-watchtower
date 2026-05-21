import postgres from 'postgres';
import { config } from './config.js';

const url =
  config.NODE_ENV === 'test' && config.DATABASE_URL_TEST
    ? config.DATABASE_URL_TEST
    : config.DATABASE_URL;

const sql = postgres(url, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;
export type Sql = typeof sql;
export type Tx = postgres.TransactionSql;
