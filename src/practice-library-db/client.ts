import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "@/practice-library-db/schema";

type PracticeDb = NeonDatabase<typeof schema>;

let cached: PracticeDb | null = null;

export function getPracticeDb(): PracticeDb | null {
  const connectionString = process.env.PRACTICE_LIBRARY_DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (cached) {
    return cached;
  }

  const pool = new Pool({ connectionString });
  cached = drizzle(pool, { schema });
  return cached;
}
