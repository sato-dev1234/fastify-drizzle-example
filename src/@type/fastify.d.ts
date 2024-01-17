import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Container } from "inversify";
import { Client } from "pg";

import * as schema from "@/infrastructure/db/schema";

declare module "fastify" {
  interface FastifyInstance {
    container: Container;
    db: NodePgDatabase<typeof schema>;
    pg: Client;
    config: {
      DATABASE_URL: string;
    };
    getFactory<TService>(symbol: any): TService;
  }
}
