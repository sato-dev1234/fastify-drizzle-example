import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { FastifyInstance } from "fastify";
import { Client } from "pg";

import * as schema from "@/infrastructure/db/schema";
import { TYPES } from "@/plugins/container/types";

export const setupDb = async (fastify: FastifyInstance): Promise<void> => {
  const client = new Client({
    connectionString: fastify.config.DATABASE_URL,
  });
  try {
    await client.connect();
    fastify.decorate("pg", client);
    const drizzleClient: NodePgDatabase<typeof schema> = drizzle(fastify.pg, {
      schema,
    });
    fastify.container
      .bind(TYPES.DB)
      .toDynamicValue(() => drizzleClient)
      .inSingletonScope();
  } catch (error) {
    fastify.log.error(error);
    throw error;
  }

  fastify.addHook("onClose", async () => {
    await fastify.pg.end();
  });
};
