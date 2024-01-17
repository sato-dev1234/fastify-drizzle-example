import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

const environment = process.env.NODE_ENV;
dotenv.config({ path: `.env.${environment}` });

export default {
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle/default",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  }
} satisfies Config;