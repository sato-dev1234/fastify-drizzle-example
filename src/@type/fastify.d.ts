import { Container } from "inversify";
import { Client } from "pg";

declare module "fastify" {
  interface FastifyInstance {
    container: Container;
    pg: Client;
    config: {
      DATABASE_URL: string;
    };
  }
}
