import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";
import { serverEnv } from "@/lib/env/server";

const globalForDb = globalThis as typeof globalThis & {
  agribatchSql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.agribatchSql ??
  postgres(serverEnv.DATABASE_URL, {
    idle_timeout: 20,
    max: 5,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.agribatchSql = sql;
}

export const db = drizzle(sql, { schema });
export { sql };
