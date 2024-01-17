import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: `.env.e2e_test` });

export default {
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle/e2e_test",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  }
} satisfies Config;