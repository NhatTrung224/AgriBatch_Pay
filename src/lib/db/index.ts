import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env/server";

type SqlClient = ReturnType<typeof postgres>;
const globalForDb = globalThis as typeof globalThis & {
  agribatchDb?: DbClient;
  agribatchSql?: SqlClient;
};

function createSql() {
  return postgres(getServerEnv().DATABASE_URL, {
    idle_timeout: 20,
    max: 5,
    prepare: false,
  });
}

function createDb(sql: SqlClient) {
  return drizzle(sql, { schema });
}

type DbClient = ReturnType<typeof createDb>;

let cachedSql: SqlClient | undefined;
let cachedDb: DbClient | undefined;

function cacheSql(sql: SqlClient) {
  cachedSql = sql;

  if (process.env.NODE_ENV !== "production") {
    globalForDb.agribatchSql = sql;
  }

  return sql;
}

function cacheDb(db: DbClient) {
  cachedDb = db;

  if (process.env.NODE_ENV !== "production") {
    globalForDb.agribatchDb = db;
  }

  return db;
}

export function getSql() {
  return (
    cachedSql ??
    globalForDb.agribatchSql ??
    cacheSql(createSql())
  );
}

export function getDb() {
  return (
    cachedDb ??
    globalForDb.agribatchDb ??
    cacheDb(createDb(getSql()))
  );
}

export const sql = new Proxy({} as SqlClient, {
  get(_target, property) {
    const currentSql = getSql();
    return Reflect.get(currentSql, property, currentSql);
  },
});

export const db = new Proxy({} as DbClient, {
  get(_target, property) {
    const currentDb = getDb();
    return Reflect.get(currentDb, property, currentDb);
  },
});
