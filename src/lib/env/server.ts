import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | undefined;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT,
  });

  return cachedServerEnv;
}
