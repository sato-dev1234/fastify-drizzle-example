import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { Client } from "pg";

import * as schema from "@/infrastructure/db/schema";

const dbPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> => {
  const client = new Client({
    connectionString: fastify.config.DATABASE_URL,
  });
  try {
    await client.connect();
    fastify.decorate("pg", client);
    const drizzleClient: NodePgDatabase<typeof schema> = drizzle(fastify.pg, {
      schema,
    });
    fastify.decorate("db", drizzleClient);
  } catch (error) {
    fastify.log.error(error);
    throw error;
  }

  fastify.addHook("onClose", async () => {
    await fastify.pg.end();
  });
};

export default fastifyPlugin(dbPlugin, "4.x");
