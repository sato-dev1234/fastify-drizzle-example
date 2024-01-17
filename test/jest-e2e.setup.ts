import * as dotenv from "dotenv";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { PgTable } from "drizzle-orm/pg-core";
import { Client } from "pg";

import { user, contact } from "@/infrastructure/db/schema";

dotenv.config({ path: `.env.e2e_test` });

export const client: Client = new Client({
  connectionString: process.env.DATABASE_URL,
});
const allTables: PgTable[] = [contact, user];

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  const db: NodePgDatabase = drizzle(client);
  const deletePromises = allTables.map(async (table) => {
    await db.delete(table);
  });
  await Promise.all(deletePromises);
});

afterAll(async () => {
  await client.end();
});
