import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema/auth";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

console.log(
  "[db] DATABASE_URL:",
  connectionString.replace(/:\/\/[^@]+@/, "://***:***@"),
);

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });

export type Database = typeof db;

export async function withEnterpriseDb<T>(
  enterpriseId: string,
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("SET LOCAL app.current_enterprise_id = $1", [
      enterpriseId,
    ]);

    const scopedDb = drizzle(client, { schema }) as unknown as Database;

    const result = await fn(scopedDb);

    return result;
  } finally {
    client.release();
  }
}
