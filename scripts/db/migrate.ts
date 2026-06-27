import "dotenv/config";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "@/lib/db";

async function main() {
  await migrate(db, {
    migrationsFolder: "drizzle",
  });
  await sql.end({ timeout: 5 });
}

main().catch(async (error) => {
  console.error("Database migration failed.", error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
